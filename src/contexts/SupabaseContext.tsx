
import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/components/ui/use-toast';

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

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

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
      toast({
        variant: "destructive",
        title: "Error signing in with Google",
        description: error instanceof Error ? error.message : "An error occurred",
      });
      console.error('Google sign-in error:', error);
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
      
      // Update last magic link request time
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
        toast({
          variant: "destructive",
          title: "Error sending magic link",
          description: error instanceof Error ? error.message : "An error occurred",
        });
      }
      console.error('Magic link error:', error);
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      toast({
        title: "Signed out",
        description: "You have been successfully signed out.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error signing out",
        description: error instanceof Error ? error.message : "An error occurred",
      });
      console.error('Sign out error:', error);
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
