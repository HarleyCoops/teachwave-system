import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';
import Stripe from 'https://esm.sh/stripe@12.0.0?target=deno';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  httpClient: Stripe.createFetchHttpClient(),
  apiVersion: '2023-10-16',
});

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Max-Age': '86400',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: corsHeaders
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
    console.log('Request headers:', Object.fromEntries(req.headers.entries()));
    
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
    const { data: profile, error: profileError } = await supabaseClient
      .from('profiles')
      .select('stripe_customer_id')
      .eq('id', user.id)
      .single();

    if (profileError) {
      console.error('Profile error:', profileError);
      throw profileError;
    }

    if (!profile?.stripe_customer_id) {
      throw new Error('No associated Stripe customer');
    }
    console.log('Found customer ID:', profile.stripe_customer_id);

    console.log('Creating portal session...');
    const { url } = await stripe.billingPortal.sessions.create({
      customer: profile.stripe_customer_id,
      return_url: `${req.headers.get('origin')}/dashboard`,
    });
    console.log('Created portal session with URL');

    return new Response(
      JSON.stringify({ url }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    );
  } catch (error) {
    console.error('Portal session error:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: error instanceof Error ? error.stack : undefined
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    );
  }
});
