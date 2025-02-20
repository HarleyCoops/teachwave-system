import { loadStripe } from '@stripe/stripe-js';
import { supabase } from './supabase';
import { useState, useEffect } from 'react';

// Initialize Stripe
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

// Constants
const STRIPE_PRICE_ID = import.meta.env.VITE_STRIPE_PRICE_ID;
export { STRIPE_PRICE_ID };

export const stripe = {
  /**
   * Create a Stripe Checkout session for subscription
   */
  async createCheckoutSession(priceId: string) {
    try {
      const { data: { session: authSession } } = await supabase.auth.getSession();
      if (!authSession?.access_token) throw new Error('Not authenticated');

      console.log('Invoking checkout session with token:', authSession.access_token);
      const { data, error: functionError } = await supabase.functions.invoke('create_checkout_session', {
        body: { priceId },
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authSession.access_token}`
        }
      });

      if (functionError) {
        console.error('Function error:', functionError);
        throw functionError;
      }

      if (!data?.session) {
        console.error('No session in response:', data);
        throw new Error('No session in response from checkout session');
      }
      const { session } = data;
      console.log('Got checkout session:', session);

      const stripe = await stripePromise;
      if (!stripe) throw new Error('Stripe failed to initialize');

      const { error: checkoutError } = await stripe.redirectToCheckout({
        sessionId: session.id
      });

      if (checkoutError) throw checkoutError;
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  },

  /**
   * Create a Stripe Customer Portal session
   */
  async createPortalSession() {
    try {
      const { data: { session: authSession } } = await supabase.auth.getSession();
      if (!authSession) throw new Error('Not authenticated');

      console.log('Invoking portal session with token:', authSession.access_token);
      const { data, error: functionError } = await supabase.functions.invoke('create_portal_session', {
        body: {},
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authSession.access_token}`
        }
      });

      if (functionError) {
        console.error('Function error:', functionError);
        throw functionError;
      }

      if (!data?.url) {
        console.error('No URL in response:', data);
        throw new Error('No URL in response from portal session');
      }

      console.log('Got portal URL:', data.url);

      window.location.href = data.url;
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  },

  /**
   * Check if user has an active subscription
   */
  async checkSubscription() {
    try {
      const { data: { session: authSession } } = await supabase.auth.getSession();
      if (!authSession?.access_token) {
        console.log('No auth session, returning free tier');
        return { isActive: false, tier: 'free' };
      }

      console.log('Checking subscription status for user');
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('subscription_status, subscription_tier')
        .eq('id', authSession.user.id)
        .single();

      if (profileError) {
        console.error('Profile error:', profileError);
        // If no profile exists, create one
        if (profileError.code === 'PGRST116') {
          const { error: insertError } = await supabase
            .from('profiles')
            .insert({ 
              id: authSession.user.id,
              email: authSession.user.email,
              subscription_status: 'canceled',
              subscription_tier: 'free'
            });
          
          if (insertError) {
            console.error('Insert error:', insertError);
            return { isActive: false, tier: 'free' };
          }
          
          return { isActive: false, tier: 'free' };
        }
        return { isActive: false, tier: 'free' };
      }

      if (!profile) {
        console.log('No profile found, returning free tier');
        return { isActive: false, tier: 'free' };
      }

      console.log('Found subscription status:', profile.subscription_status);
      return {
        isActive: profile.subscription_status === 'active',
        tier: profile.subscription_tier || 'free'
      };
    } catch (error) {
      console.error('Error checking subscription:', error);
      return { isActive: false, tier: 'free' };
    }
  }
};

// Hook to check subscription status
export const useSubscription = () => {
  const [isActive, setIsActive] = useState(false);
  const [tier, setTier] = useState<'free' | 'premium'>('free');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const checkSub = async () => {
      if (!mounted) return;
      
      try {
        setLoading(true);
        const { isActive: active, tier: subTier } = await stripe.checkSubscription();
        if (mounted) {
          setIsActive(active);
          setTier(subTier || 'free');
        }
      } catch (error) {
        console.error('Error checking subscription:', error);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    // Check subscription initially
    checkSub();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      if (mounted) {
        checkSub();
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  return { isActive, tier, loading };
};
