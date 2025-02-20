import { loadStripe } from '@stripe/stripe-js';
import { supabase } from '@/lib/supabase';
import { useState, useEffect } from 'react';

const STRIPE_PUBLISHABLE_KEY = 'pk_live_51QoezIIOLkCszIIOisfZDkfVqcrE9qdh5IiaTM69bvL3Mz9iZ4oUplFBDxKGKrQr9ew52Y3JpU7z4MQOqltDerP800CC3wtTxD';
export const STRIPE_PRICE_ID = 'price_1QpL30IOLkCszIIOiDXZ3rLb';

if (!STRIPE_PUBLISHABLE_KEY) {
  throw new Error('Missing Stripe publishable key');
}

if (!STRIPE_PRICE_ID) {
  throw new Error('Missing Stripe price ID');
}

const stripePromise = loadStripe(STRIPE_PUBLISHABLE_KEY, {
  apiVersion: '2023-10-16'
});

export const stripe = {
  async createCheckoutSession(priceId: string) {
    try {
      const { data: { session: authSession } } = await supabase.auth.getSession();
      if (!authSession?.access_token) throw new Error('Not authenticated');

      console.log('Creating checkout session for price:', priceId);
      
      const response = await supabase.functions.invoke('create-checkout-session', {
        body: { priceId },
        headers: {
          Authorization: `Bearer ${authSession.access_token}`,
        }
      });

      if (response.error) {
        console.error('Checkout session error:', response.error);
        throw new Error(response.error.message || 'Failed to create checkout session');
      }

      if (!response.data?.session?.id) {
        console.error('No session ID in response:', response.data);
        throw new Error('No session ID returned');
      }

      const stripe = await stripePromise;
      if (!stripe) throw new Error('Stripe failed to initialize');

      const { error: redirectError } = await stripe.redirectToCheckout({
        sessionId: response.data.session.id
      });

      if (redirectError) {
        console.error('Redirect error:', redirectError);
        throw redirectError;
      }
    } catch (error) {
      console.error('Error in createCheckoutSession:', error);
      throw error;
    }
  },

  async createPortalSession() {
    try {
      const { data: { session: authSession } } = await supabase.auth.getSession();
      if (!authSession) throw new Error('Not authenticated');

      console.log('Invoking portal session with token:', authSession.access_token);
      const { data, error: functionError } = await supabase.functions.invoke('create-portal-session', {
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
        .select('subscription_status, subscription_tier, subscription_end_date')
        .eq('id', authSession.user.id)
        .single();

      if (profileError) {
        console.error('Profile error:', profileError);
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
      
      const isActive = ['active', 'trialing'].includes(profile.subscription_status || '');
      
      const hasExpired = profile.subscription_end_date && 
        new Date(profile.subscription_end_date) < new Date();

      return {
        isActive: isActive && !hasExpired,
        tier: profile.subscription_tier || 'free',
        status: profile.subscription_status || 'canceled',
        endDate: profile.subscription_end_date
      };
    } catch (error) {
      console.error('Error checking subscription:', error);
      return { isActive: false, tier: 'free', status: 'error' };
    }
  }
};

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

    checkSub();

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
