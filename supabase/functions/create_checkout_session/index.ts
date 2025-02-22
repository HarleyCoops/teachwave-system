import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';
import Stripe from 'https://esm.sh/stripe@12.0.0?target=deno';
import { StripeError, corsHeaders } from '../_shared/stripe-error.ts';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2023-10-16',
});

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Log request details
    console.log('Request method:', req.method);
    console.log('Request headers:', Object.fromEntries(req.headers.entries()));
    
    // Get the raw body text
    const rawBody = await req.text();
    console.log('Raw request body:', rawBody);

    // Parse the body if it exists
    let body;
    try {
      body = rawBody ? JSON.parse(rawBody) : {};
      console.log('Parsed body:', body);
    } catch (e) {
      console.error('Error parsing body:', e);
      throw new StripeError('Invalid JSON body', 400);
    }

    // Validate priceId exists
    if (!body.priceId) {
      console.error('Missing priceId in body:', body);
      throw new StripeError('Price ID is required', 400);
    }

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new StripeError('Authorization header is missing', 401);
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') || '',
      Deno.env.get('SUPABASE_ANON_KEY') || ''
    );

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (userError || !user) {
      console.error('User error:', userError);
      throw new StripeError('User not found', 401);
    }

    // Get or create Stripe customer
    let customerId: string;
    const { data: profile, error: profileError } = await supabaseClient
      .from('profiles')
      .select('stripe_customer_id')
      .eq('id', user.id)
      .single();

    if (profileError) {
      console.error('Error fetching profile:', profileError);
      throw new StripeError(`Error fetching profile: ${profileError.message}`, 500);
    }

    if (profile?.stripe_customer_id) {
      console.log('Using existing customer:', profile.stripe_customer_id);
      customerId = profile.stripe_customer_id;
    } else {
      console.log('Creating new customer for user:', user.id);
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: {
          supabase_uid: user.id,
        },
      });
      customerId = customer.id;

      const { error: updateError } = await supabaseClient
        .from('profiles')
        .update({ stripe_customer_id: customerId })
        .eq('id', user.id);

      if (updateError) {
        console.error('Error updating profile with customer ID:', updateError);
        throw new StripeError(`Error updating profile: ${updateError.message}`, 500);
      }
      console.log('Created and linked new customer:', customerId);
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      line_items: [{ price: body.priceId, quantity: 1 }],
      mode: 'subscription',
      success_url: `${req.headers.get('origin')}/dashboard?success=true`,
      cancel_url: `${req.headers.get('origin')}/dashboard?canceled=true`,
      automatic_tax: { enabled: true },
      allow_promotion_codes: true,
      customer_update: {
        address: 'auto',
        name: 'auto',
      },
    });

    console.log('Created checkout session:', session.id);

    return new Response(JSON.stringify({ session }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    console.error('Error:', error);
    const statusCode = error instanceof StripeError ? error.statusCode : 500;
    const message = error instanceof Error ? error.message : 'An unknown error occurred';

    return new Response(
      JSON.stringify({
        error: message,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: statusCode,
      }
    );
  }
});
