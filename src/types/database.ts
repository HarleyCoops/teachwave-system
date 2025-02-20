export type Profile = {
  id: string;
  email: string;
  stripe_customer_id: string | null;
  subscription_status: 'active' | 'trialing' | 'past_due' | 'canceled' | 'incomplete' | null;
  subscription_tier: 'free' | 'premium' | null;
  subscription_end_date: string | null;
  created_at: string;
  updated_at: string;
};

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Omit<Profile, 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Profile, 'id' | 'created_at' | 'updated_at'>>;
      };
    };
    Functions: {
      handle_new_user: {
        Args: Record<string, never>;
        Returns: undefined;
      };
      handle_updated_at: {
        Args: Record<string, never>;
        Returns: undefined;
      };
    };
  };
};
