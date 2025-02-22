import { useSupabase } from '@/contexts/SupabaseContext';
import { Link } from 'react-router-dom';
import { stripe, STRIPE_PRICE_ID } from '@/lib/stripe';
import { useToast } from '@/components/ui/use-toast';

export const Navigation = () => {
  const { user, signInWithGoogle, signOut } = useSupabase();
  const { toast } = useToast();

  const handleSubscribe = async () => {
    try {
      console.log('Creating checkout session with priceId:', STRIPE_PRICE_ID);
      await stripe.createCheckoutSession(STRIPE_PRICE_ID);
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to start subscription process',
        variant: 'destructive',
      });
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 bg-white border-b z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="text-xl font-bold text-primary">
          justCalculations™
        </Link>
        
        <div className="flex items-center gap-4">
          {user ? (
            <>
              <button
                onClick={handleSubscribe}
                className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary-dark transition-colors"
              >
                Subscribe Now
              </button>
              <Link to="/dashboard" className="text-neutral-600 hover:text-primary">
                Dashboard
              </Link>
              <button
                onClick={signOut}
                className="text-neutral-600 hover:text-primary"
              >
                Sign Out
              </button>
            </>
          ) : (
            <button
              onClick={signInWithGoogle}
              className="text-neutral-600 hover:text-primary"
            >
              Sign In
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};
