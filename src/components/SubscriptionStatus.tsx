import React from 'react';
import { useToast } from '@/components/ui/use-toast';
import { stripe, useSubscription } from '@/lib/stripe';
import { useSupabase } from '@/contexts/SupabaseContext';
import { Loader2 } from 'lucide-react';
import { SubscriptionButton } from '@/components/SubscriptionButton';

interface SubscriptionStatusProps {
  className?: string;
}

export const SubscriptionStatus: React.FC<SubscriptionStatusProps> = ({
  className = '',
}) => {
  const { toast } = useToast();
  const { user } = useSupabase();
  const { isActive, tier, loading } = useSubscription();

  const [isRedirecting, setIsRedirecting] = React.useState(false);

  const handleManageSubscription = async () => {
    if (isRedirecting) return;
    setIsRedirecting(true);

    if (!user) {
      toast({
        title: 'Sign in required',
        description: 'Please sign in to manage your subscription.',
        variant: 'destructive',
      });
      setIsRedirecting(false);
      return;
    }

    try {
      await stripe.createPortalSession();
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to open subscription management. Please try again.',
        variant: 'destructive',
      });
      setIsRedirecting(false);
    }
  };

  if (loading) {
    return (
      <div className={`flex items-center justify-center p-4 ${className}`}>
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <span className="text-sm text-neutral-600">Loading subscription status...</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Subscription Status</h3>
          <p className="text-sm text-neutral-600">
            {isActive ? (
              <>You have an active {tier} subscription.</>
            ) : (
              <>You are currently on the {tier} tier.</>
            )}
          </p>
        </div>
        {isActive && (
          <button
            onClick={handleManageSubscription}
            disabled={isRedirecting}
            className="text-primary hover:text-primary-dark text-sm inline-flex items-center gap-2"
          >
            {isRedirecting && <Loader2 className="h-3 w-3 animate-spin" />}
            {isRedirecting ? 'Redirecting...' : 'Manage Subscription'}
          </button>
        )}
      </div>
      
      {!isActive && (
        <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
          <p className="text-sm text-neutral-700 mb-4">
            Upgrade to premium to access all case studies and features.
          </p>
          <SubscriptionButton className="w-full bg-primary text-white hover:bg-primary/90 py-2 px-4 rounded-md transition-colors">
            Upgrade to Premium
          </SubscriptionButton>
        </div>
      )}
    </div>
  );
};
