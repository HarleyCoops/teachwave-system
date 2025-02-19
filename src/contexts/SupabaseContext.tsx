
import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { User, AuthError } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/components/ui/use-toast';
import { useLocation, useNavigate } from 'react-router-dom';

interface SupabaseContextType {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithMagicLink: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const SupabaseContext = createContext<SupabaseContextType | undefined>(undefined);

export const SupabaseProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const [lastMagicLinkTime, setLastMagicLinkTime] = useState<number>(0);
  const location = useLocation();
  const navigate = useNavigate();

  const handleAuthStateChange = useCallback((_event: string, session: { user: User | null }) => {
    setUser(session?.user ?? null);
    setLoading(false);

    // Handle redirect after successful authentication
    const params = new URLSearchParams(location.search);
    const redirectPath = params.get('redirect');
    if (session?.user && redirectPath) {
      navigate(decodeURIComponent(redirectPath), { replace: true });
    }
  }, [location.search, navigate]);

  useEffect(() => {
    // Persist session in localStorage
    const persistedSession = localStorage.getItem('supabase.auth.token');
    if (persistedSession) {
      try {
        const session = JSON.parse(persistedSession);
        setUser(session.user ?? null);
      } catch (error) {
        console.error('Error parsing persisted session:', error);
        localStorage.removeItem('supabase.auth.token');
      }
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session) {
        localStorage.setItem('supabase.auth.token', JSON.stringify(session));
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      handleAuthStateChange(event, session);
      if (session) {
        localStorage.setItem('supabase.auth.token', JSON.stringify(session));
      } else {
        localStorage.removeItem('supabase.auth.token');
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [handleAuthStateChange]);

  const handleAuthError = (error: AuthError | Error, action: string) => {
    const errorMessage = error instanceof AuthError ? error.message : error.message;
    toast({
      variant: "destructive",
      title: `Error ${action}`,
      description: errorMessage,
    });
    console.error(`${action} error:`, error);
  };

  const signInWithGoogle = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin
        }
      });
      
      if (error) throw error;
    } catch (error) {
      handleAuthError(error as AuthError | Error, 'signing in with Google');
    }
  };

  const signInWithMagicLink = async (email: string) => {
    try {
      // Check if enough time has passed since the last magic link request
      const now = Date.now();
      const timePassedSinceLastRequest = now - lastMagicLinkTime;
      const MIN_TIME_BETWEEN_REQUESTS = 60000; // 60 seconds in milliseconds

      if (timePassedSinceLastRequest < MIN_TIME_BETWEEN_REQUESTS) {
        const secondsToWait = Math.ceil((MIN_TIME_BETWEEN_REQUESTS - timePassedSinceLastRequest) / 1000);
        toast({
          variant: "destructive",
          title: "Please wait before requesting another magic link",
          description: `You can request another magic link in ${secondsToWait} seconds`,
        });
        return;
      }

      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: window.location.origin
        }
      });
      
      if (error) throw error;
      
      setLastMagicLinkTime(now);
      
      toast({
        title: "Magic link sent",
        description: "Check your email for the login link. You may request another link in 60 seconds.",
      });
    } catch (error) {
      if (error instanceof Error && error.message.includes('rate limit')) {
        toast({
          variant: "destructive",
          title: "Too many attempts",
          description: "Please wait a minute before requesting another magic link",
        });
      } else {
        handleAuthError(error as AuthError | Error, 'sending magic link');
      }
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      localStorage.removeItem('supabase.auth.token');
      navigate('/', { replace: true });
      
      toast({
        title: "Signed out",
        description: "You have been successfully signed out.",
      });
    } catch (error) {
      handleAuthError(error as AuthError | Error, 'signing out');
    }
  };

  return (
    <SupabaseContext.Provider value={{ user, loading, signInWithGoogle, signInWithMagicLink, signOut }}>
      {children}
    </SupabaseContext.Provider>
  );
};

export const useSupabase = () => {
  const context = useContext(SupabaseContext);
  if (context === undefined) {
    throw new Error('useSupabase must be used within a SupabaseProvider');
  }
  return context;
};
