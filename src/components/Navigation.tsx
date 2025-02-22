import { useSupabase } from '@/contexts/SupabaseContext';
import { Link } from 'react-router-dom';
import { stripe, STRIPE_PRICE_ID } from '@/lib/stripe';
import { useToast } from '@/components/ui/use-toast';
import { useScroll } from '@/hooks/use-scroll';

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

  const scrolled = useScroll();

  return (
    <nav className={`
      fixed top-0 left-0 right-0 z-50
      transition-all duration-300 ease-in-out
      ${scrolled ? 'bg-white shadow-sm' : 'bg-transparent'}
    `}>
      <div className={`
        container mx-auto px-4 h-16 grid grid-cols-3 items-center
        transition-opacity duration-300 ease-in-out
        ${scrolled ? 'opacity-100' : 'opacity-0'}
      `}>
        {/* Left column - empty for now */}
        <div></div>
        
        {/* Center column - brand name */}
        <div className="flex justify-center">
          <Link to="/" className={`
            text-[1.8rem] font-bold m-0 brand-tm
            transition-all duration-300 ease-in-out
            ${scrolled ? 'text-accent-dark' : 'text-white'}
            hover:text-primary
          `}>
            justCalculations
          </Link>
        </div>
        
        {/* Right column - auth buttons */}
        <div className="flex items-center gap-4 justify-end">
          {user ? (
            <>
              <button
                onClick={handleSubscribe}
                className="button-primary"
              >
                Subscribe Now
              </button>
              <Link to="/dashboard" className={`
                transition-colors
                ${scrolled ? 'text-accent-dark' : 'text-white'}
                hover:text-primary
              `}>
                Dashboard
              </Link>
              <button
                onClick={signOut}
                className={`
                  transition-colors
                  ${scrolled ? 'text-accent-dark' : 'text-white'}
                  hover:text-primary
                `}
              >
                Sign Out
              </button>
            </>
          ) : (
            <button
              onClick={signInWithGoogle}
              className={`
                transition-colors
                ${scrolled ? 'text-accent-dark' : 'text-white'}
                hover:text-primary
              `}
            >
              Sign In
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};
