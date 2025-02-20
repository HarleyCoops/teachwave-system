
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, stripe-signature, origin',
  'Access-Control-Max-Age': '86400',
};

export class StripeError extends Error {
  constructor(
    message: string,
    public statusCode: number = 400,
    public details?: unknown
  ) {
    super(message);
    this.name = 'StripeError';
  }
}

export function handleError(error: unknown) {
  console.error('Error:', error);
  
  const stripeError = error instanceof StripeError
    ? error
    : new StripeError(
        error instanceof Error ? error.message : 'An unknown error occurred',
        500,
        error instanceof Error ? error.stack : undefined
      );

  return new Response(
    JSON.stringify({
      error: stripeError.message,
      details: stripeError.details,
    }),
    {
      status: stripeError.statusCode,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    }
  );
}
