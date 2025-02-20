
import Stripe from 'stripe';
import { StripeError } from './stripe-error';

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

export async function validateEmail(email: string): Promise<boolean> {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export async function createCustomerWithRetry(
  stripe: Stripe,
  email: string,
  metadata: Record<string, string>,
  retryCount = 0
): Promise<Stripe.Customer> {
  try {
    if (!await validateEmail(email)) {
      throw new StripeError('Invalid email address', 400);
    }

    return await stripe.customers.create({
      email,
      metadata,
    });
  } catch (error) {
    // If we've exceeded max retries, throw the error
    if (retryCount >= MAX_RETRIES) {
      throw error;
    }

    // If it's a rate limit error or a conflict, retry
    if (
      error instanceof Stripe.errors.StripeError &&
      (error.type === 'rate_limit' || error.code === 'resource_already_exists')
    ) {
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * (retryCount + 1)));
      return createCustomerWithRetry(stripe, email, metadata, retryCount + 1);
    }

    // For other errors, throw immediately
    throw error;
  }
} 
