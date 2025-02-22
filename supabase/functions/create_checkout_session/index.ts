/// <reference lib="deno.ns" />
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';
import Stripe from 'https://esm.sh/stripe@12.0.0?target=deno';
import { corsHeaders, StripeError, handleError } from '../../../src/lib/stripe-error.ts';

console.log('create_checkout_session function initialized');

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2023-10-16',
});

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  // Require POST method
  if (req.method !== 'POST') {
    throw new StripeError('Method not allowed', 405);
  }

  try {
    // Get environment variables
    const supabaseUrl = Deno.env.get('VITE_SUPABASE_URL');
    const supabaseAnonKey = Deno.env.get('VITE_SUPABASE_ANON_KEY');
    
    if (!supabaseUrl || !supabaseAnonKey) {
      throw new StripeError('Missing Supabase configuration', 500);
    }

    // Log environment variables (safely)
    console.log('Environment check:', {
      SUPABASE_URL: supabaseUrl.substring(0, 10) + '...',
      SUPABASE_ANON_KEY: supabaseAnonKey.substring(0, 10) + '...',
      STRIPE_SECRET_KEY: Deno.env.get('STRIPE_SECRET_KEY')?.substring(0, 10) + '...',
    });
    
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new StripeError('No authorization header', 401);
    }

    const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    if (authError) {
      console.error('Auth error:', authError);
      throw new StripeError(`Authentication failed: ${authError.message}`, 401);
    }

    if (!user) {
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
      console.error('Profile error:', profileError);
      throw new StripeError(`Failed to fetch profile: ${profileError.message}`, 500);
    }

    if (profile?.stripe_customer_id) {
      customerId = profile.stripe_customer_id;
    } else {
      try {
        const customer = await stripe.customers.create({
          email: user.email,
          metadata: { supabase_uid: user.id },
        });
        customerId = customer.id;

        const { error: updateError } = await supabaseClient
          .from('profiles')
          .update({ stripe_customer_id: customerId })
          .eq('id', user.id);

        if (updateError) {
          throw new StripeError(`Failed to update profile: ${updateError.message}`, 500);
        }
      } catch (error) {
        throw new StripeError(`Failed to create Stripe customer: ${error.message}`, 500);
      }
    }

    const { priceId } = await req.json();
    if (!priceId) {
      throw new StripeError('Price ID is required', 400);
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      line_items: [{ price: priceId, quantity: 1 }],
      mode: 'subscription',
      success_url: `${req.headers.get('origin')}/dashboard?success=true`,
      cancel_url: `${req.headers.get('origin')}?canceled=true`,
      automatic_tax: { enabled: true },
      allow_promotion_codes: true,
    });

    return new Response(JSON.stringify({ session }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    return handleError(error);
  }
});
