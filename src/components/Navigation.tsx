import { useSupabase } from '@/contexts/SupabaseContext';
import { Link } from 'react-router-dom';
import { stripe, STRIPE_PRICE_ID } from '@/lib/stripe';
import { useToast } from '@/components/ui/use-toast';

export const Navigation = () => {
  const { user, signInWithGoogle, signOut } = useSupabase();
  const { toast } = useToast();

  const handleSubscribe = async () => {
    try {
      console.log('Creating checkout session...');
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
        <Link to="/" className="text-xl font-bold text-[#9b87f5]">
          justCalculations
        </Link>
        
        <div className="flex items-center gap-4">
          {user ? (
            <>
              <button
                onClick={handleSubscribe}
                className="bg-[#9b87f5] text-white px-4 py-2 rounded-md hover:bg-[#7a69c7] transition-colors"
              >
                Subscribe Now
              </button>
              <Link to="/dashboard" className="text-neutral-600 hover:text-[#9b87f5]">
                Dashboard
              </Link>
              <button
                onClick={signOut}
                className="text-neutral-600 hover:text-[#9b87f5]"
              >
                Sign Out
              </button>
            </>
          ) : (
            <button
              onClick={signInWithGoogle}
              className="text-neutral-600 hover:text-[#9b87f5]"
            >
              Sign In
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};
