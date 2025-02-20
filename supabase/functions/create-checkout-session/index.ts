import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';
import Stripe from 'https://esm.sh/stripe@12.0.0?target=deno';
import { corsHeaders, handleError, StripeError } from '../lib/stripe-error.ts';
import { createCustomerWithRetry } from '../lib/stripe-utils.ts';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  httpClient: Stripe.createFetchHttpClient(),
  apiVersion: '2023-10-16',
});

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    if (req.method !== 'POST') {
      throw new StripeError('Method not allowed', 405);
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: { headers: { Authorization: req.headers.get('Authorization') ?? '' } },
      }
    );

    // Get the user from Supabase auth
    const {
      data: { user },
      error: authError
    } = await supabaseClient.auth.getUser();

    if (authError) {
      throw new StripeError('Authentication failed', 401, authError);
    }

    if (!user) {
      throw new StripeError('User not found', 401);
    }

    // Get or create Stripe customer
    const { data: profiles } = await supabaseClient
      .from('profiles')
      .select('stripe_customer_id')
      .eq('id', user.id)
      .single();

    let customerId = profiles?.stripe_customer_id;

    if (!customerId) {
      // Create a new customer with retry logic
      const customer = await createCustomerWithRetry(
        stripe,
        user.email,
        {
          supabase_uid: user.id,
        }
      );

      customerId = customer.id;

      // Update profile with Stripe customer ID
      const { error } = await supabaseClient
        .from('profiles')
        .update({ 
          stripe_customer_id: customerId,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) throw new StripeError('Failed to update profile', 500, error);
    }

    // Create checkout session
    const { priceId } = await req.json();
    
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

    return new Response(
      JSON.stringify({ session }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    );
  } catch (error) {
    return handleError(error);
  }
});
