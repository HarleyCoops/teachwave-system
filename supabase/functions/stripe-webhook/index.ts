import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';
import Stripe from 'https://esm.sh/stripe@12.0.0?target=deno';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  httpClient: Stripe.createFetchHttpClient(),
  apiVersion: '2023-10-16',
});

const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

serve(async (req) => {
  const signature = req.headers.get('stripe-signature');

  if (!signature) {
    return new Response('No signature', { status: 400 });
  }

  try {
    const body = await req.text();
    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');
    if (!webhookSecret) {
      throw new Error('Missing webhook secret');
    }

    const event = stripe.webhooks.constructEvent(body, signature, webhookSecret);

    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;
        
        // Get customer's email
        const customer = await stripe.customers.retrieve(customerId);
        if (!customer || customer.deleted) {
          throw new Error('No customer found');
        }

        // Update profile
        const { error } = await supabase
          .from('profiles')
          .update({
            subscription_status: subscription.status,
            subscription_tier: subscription.status === 'active' ? 'premium' : 'free',
            subscription_end_date: new Date(subscription.current_period_end * 1000).toISOString(),
          })
          .eq('stripe_customer_id', customerId);

        if (error) throw error;
        break;

      case 'customer.subscription.deleted':
        const deletedSubscription = event.data.object as Stripe.Subscription;
        const deletedCustomerId = deletedSubscription.customer as string;

        // Update profile to free tier
        const { error: deleteError } = await supabase
          .from('profiles')
          .update({
            subscription_status: 'canceled',
            subscription_tier: 'free',
            subscription_end_date: new Date().toISOString(),
          })
          .eq('stripe_customer_id', deletedCustomerId);

        if (deleteError) throw deleteError;
        break;

      case 'invoice.paid':
        const invoice = event.data.object as Stripe.Invoice;
        if (!invoice.subscription) break;

        const paidCustomerId = invoice.customer as string;
        
        // Update profile subscription status
        const { error: invoiceError } = await supabase
          .from('profiles')
          .update({
            subscription_status: 'active',
            subscription_tier: 'premium',
          })
          .eq('stripe_customer_id', paidCustomerId);

        if (invoiceError) throw invoiceError;
        break;

      case 'invoice.payment_failed':
        const failedInvoice = event.data.object as Stripe.Invoice;
        if (!failedInvoice.subscription) break;

        const failedCustomerId = failedInvoice.customer as string;
        
        // Update profile subscription status
        const { error: failedError } = await supabase
          .from('profiles')
          .update({
            subscription_status: 'past_due',
          })
          .eq('stripe_customer_id', failedCustomerId);

        if (failedError) throw failedError;
        break;
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('Error:', err);
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }
});
