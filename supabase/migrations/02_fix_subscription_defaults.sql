-- Add default values to subscription columns
ALTER TABLE public.profiles
ALTER COLUMN subscription_status SET DEFAULT 'canceled',
ALTER COLUMN subscription_tier SET DEFAULT 'free';

-- Update existing records with NULL values
UPDATE public.profiles
SET subscription_status = 'canceled'
WHERE subscription_status IS NULL;

UPDATE public.profiles
SET subscription_tier = 'free'
WHERE subscription_tier IS NULL;

-- Update handle_new_user function to include default values
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (
    id,
    email,
    subscription_status,
    subscription_tier
  )
  VALUES (
    new.id,
    new.email,
    'canceled',
    'free'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
