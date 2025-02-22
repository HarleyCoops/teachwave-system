import type Stripe from 'stripe';

export class StripeError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public originalError?: Error
  ) {
    super(message);
    this.name = 'StripeError';
  }
}

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Max-Age': '86400',
};

export const createCustomerWithRetry = async (
  stripe: Stripe,
  email: string,
  metadata: Record<string, string>,
  retries = 3
): Promise<Stripe.Customer> => {
  try {
    return await stripe.customers.create({
      email,
      metadata,
    });
  } catch (error) {
    if (retries > 0 && error instanceof Error && error.message.includes('rate limit')) {
      // Wait for 1 second before retrying
      await new Promise(resolve => setTimeout(resolve, 1000));
      return createCustomerWithRetry(stripe, email, metadata, retries - 1);
    }
    throw error;
  }
};
