import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';
import Stripe from 'https://esm.sh/stripe@12.0.0?target=deno';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  httpClient: Stripe.createFetchHttpClient(),
  apiVersion: '2023-10-16',
});

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Max-Age': '86400',
  'Access-Control-Expose-Headers': '*'
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      status: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/plain',
        'Access-Control-Allow-Origin': req.headers.get('origin') || '*'
      }
    });
  }

  // Require POST method
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({
      error: 'Method not allowed'
    }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  try {
    // Log all environment variables
    console.log('Environment variables:', {
      PROJECT_URL: Deno.env.get('PROJECT_URL'),
      PROJECT_ANON_KEY: Deno.env.get('PROJECT_ANON_KEY')?.slice(0, 10) + '...',
      STRIPE_SECRET_KEY: Deno.env.get('STRIPE_SECRET_KEY')?.slice(0, 10) + '...',
    });

    console.log('Request headers:', Object.fromEntries(req.headers.entries()));
    console.log('Request body:', await req.clone().text());
    
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const supabaseUrl = Deno.env.get('PROJECT_URL');
    const supabaseAnonKey = Deno.env.get('PROJECT_ANON_KEY');
    
    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Missing Supabase configuration');
    }

    console.log('Creating Supabase client with URL:', supabaseUrl);
    const supabaseClient = createClient(
      supabaseUrl,
      supabaseAnonKey,
      {
        global: { headers: { Authorization: authHeader } },
      }
    );

    console.log('Getting user from auth...');
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();

    if (authError) {
      console.error('Auth error:', authError);
      throw authError;
    }

    if (!user) {
      throw new Error('User not found');
    }
    console.log('Found user:', user.id);

    console.log('Getting profile...');
    const { data: profiles, error: profileError } = await supabaseClient
      .from('profiles')
      .select('stripe_customer_id')
      .eq('id', user.id)
      .single();

    if (profileError) {
      console.error('Profile error:', profileError);
      throw profileError;
    }

    let customerId = profiles?.stripe_customer_id;

    if (!customerId) {
      // Create a new customer
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: {
          supabase_uid: user.id,
        },
      });

      customerId = customer.id;

      // Update profile with Stripe customer ID
      const { error } = await supabaseClient
        .from('profiles')
        .update({ stripe_customer_id: customerId })
        .eq('id', user.id);

      if (error) throw error;
    }

    console.log('Getting request body...');
    const { priceId } = await req.json();
    if (!priceId) {
      throw new Error('Missing price ID');
    }

    console.log('Creating checkout session...');
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${req.headers.get('origin')}/dashboard?success=true`,
      cancel_url: `${req.headers.get('origin')}?canceled=true`,
      automatic_tax: { enabled: true },
      allow_promotion_codes: true,
    });

    const response = new Response(
      JSON.stringify({ session }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': req.headers.get('origin') || '*'
        },
        status: 200,
      }
    );
    console.log('Sending successful response:', response);
    return response;
  } catch (error) {
    console.error('Checkout session error:', error);
    const errorResponse = new Response(
      JSON.stringify({ 
        error: error.message,
        details: error instanceof Error ? error.stack : undefined
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': req.headers.get('origin') || '*'
        },
        status: 500,
      }
    );
    console.log('Sending error response:', errorResponse);
    return errorResponse;
  }
});
