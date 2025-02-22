import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@12.0.0?target=deno";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';
import { StripeError, corsHeaders } from '../_shared/stripe-error.ts';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2023-10-16',
});

const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const signature = req.headers.get('Stripe-Signature');
    if (!signature || !webhookSecret) {
      throw new StripeError('Missing Stripe-Signature header or webhook secret', 401);
    }

    const body = await req.text();
    const event = stripe.webhooks.constructEvent(body, signature, webhookSecret);

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') || '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
    );

    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;
        const status = subscription.status;
        const endDate = subscription.current_period_end
          ? new Date(subscription.current_period_end * 1000)
          : null;

        console.log(`Processing ${event.type} for customer ${customerId}`);

        const { error } = await supabaseClient
          .from('profiles')
          .update({
            subscription_status: status,
            subscription_tier: status === 'active' ? 'premium' : 'free',
            subscription_end_date: endDate?.toISOString(),
          })
          .eq('stripe_customer_id', customerId);

        if (error) {
          console.error(`Error updating subscription for customer ${customerId}:`, error);
          throw new StripeError(`Failed to update profile: ${error.message}`, 500);
        }

        console.log(`Successfully updated subscription for customer ${customerId}`);
        break;
      }

      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.mode === 'payment') {
          const customerId = session.customer as string;
          
          // Retrieve the customer to get the Supabase user ID from metadata
          const customer = await stripe.customers.retrieve(customerId);
          const supabaseUserId = customer.metadata?.supabase_uid;
          
          if (!supabaseUserId) {
            throw new StripeError('No Supabase user ID found in customer metadata', 400);
          }
          
          console.log(`Processing successful payment checkout for customer ${customerId} (Supabase ID: ${supabaseUserId})`);

          const { error } = await supabaseClient
            .from('profiles')
            .update({
              stripe_customer_id: customerId,
              subscription_status: 'active',
              subscription_tier: 'premium'
            })
            .eq('id', supabaseUserId);

          if (error) {
            console.error(`Error updating profile after checkout for customer ${customerId}:`, error);
            throw new StripeError(`Failed to update profile after checkout: ${error.message}`, 500);
          }

          console.log(`Successfully processed payment checkout for customer ${customerId}`);
        }
        break;
      }

      case 'invoice.paid': {
        const invoice = event.data.object as Stripe.Invoice;
        if (invoice.subscription) {
          const subscription = await stripe.subscriptions.retrieve(invoice.subscription as string);
          const customerId = invoice.customer as string;
          const status = subscription.status;
          const endDate = subscription.current_period_end
            ? new Date(subscription.current_period_end * 1000)
            : null;

          console.log(`Processing paid invoice for customer ${customerId}`);

          const { error } = await supabaseClient
            .from('profiles')
            .update({
              subscription_status: status,
              subscription_tier: status === 'active' ? 'premium' : 'free',
              subscription_end_date: endDate?.toISOString(),
            })
            .eq('stripe_customer_id', customerId);

          if (error) {
            console.error(`Error updating subscription after invoice payment for customer ${customerId}:`, error);
            throw new StripeError(`Failed to update profile after invoice payment: ${error.message}`, 500);
          }

          console.log(`Successfully processed invoice payment for customer ${customerId}`);
        }
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = invoice.customer as string;

        console.log(`Processing failed invoice payment for customer ${customerId}`);

        const { error } = await supabaseClient
          .from('profiles')
          .update({
            subscription_status: 'past_due',
          })
          .eq('stripe_customer_id', customerId);

        if (error) {
          console.error(`Error updating subscription after failed payment for customer ${customerId}:`, error);
          throw new StripeError(`Failed to update profile after payment failure: ${error.message}`, 500);
        }

        console.log(`Successfully processed failed payment for customer ${customerId}`);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    console.error('Webhook error:', error);
    const statusCode = error instanceof StripeError ? error.statusCode : 500;
    const message = error instanceof Error ? error.message : 'An unknown error occurred';

    return new Response(
      JSON.stringify({
        error: message,
        received: false,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: statusCode,
      }
    );
  }
});
