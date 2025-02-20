import React from 'react';
import { useToast } from '@/components/ui/use-toast';
import { stripe, STRIPE_PRICE_ID } from '@/lib/stripe';
import { useSupabase } from '@/contexts/SupabaseContext';

interface SubscriptionButtonProps {
  className?: string;
  children?: React.ReactNode;
}

export const SubscriptionButton: React.FC<SubscriptionButtonProps> = ({
  className = '',
  children = 'Subscribe Now'
}) => {
  const { toast } = useToast();
  const { user } = useSupabase();
  const [loading, setLoading] = React.useState(false);

  const handleSubscribe = async () => {
    if (loading) return;
    setLoading(true);
    if (!user) {
      toast({
        title: 'Sign in required',
        description: 'Please sign in to subscribe.',
        variant: 'destructive',
      });
      return;
    }

    try {
      console.log('Using price ID:', STRIPE_PRICE_ID);
      if (!STRIPE_PRICE_ID) {
        throw new Error('Missing Stripe price ID');
      }
      await stripe.createCheckoutSession(STRIPE_PRICE_ID);
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to start subscription process. Please try again.',
        variant: 'destructive',
      });
      setLoading(false); // Only set loading false on error since success redirects
    }
  };

  return (
    <button
      onClick={handleSubscribe}
      disabled={loading}
      className={`inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ${className}`}
    >
      {loading && (
        <svg className="animate-spin -ml-1 mr-3 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      )}
      {loading ? 'Redirecting...' : children}
    </button>
  );
};
