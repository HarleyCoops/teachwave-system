-- Create profiles table
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text unique not null,
  stripe_customer_id text unique,
  subscription_status text check (subscription_status in ('active', 'trialing', 'past_due', 'canceled', 'incomplete', 'free')),
  subscription_tier text check (subscription_tier in ('free', 'premium')),
  subscription_end_date timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Enable RLS
alter table public.profiles enable row level security;

-- Read access
create policy "Users can view own profile"
  on profiles for select
  using (auth.uid() = id);

-- Insert access
create policy "Users can insert own profile"
  on profiles for insert
  with check (auth.uid() = id);

-- Update access
create policy "Users can update own profile"
  on profiles for update
  using (auth.uid() = id);

-- Auto-create profile on signup with default subscription status
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (
    id,
    email,
    subscription_status,
    subscription_tier
  )
  values (
    new.id,
    new.email,
    'free',
    'free'
  );
  return new;
end;
$$ language plpgsql security definer;

-- Drop existing trigger if it exists
drop trigger if exists on_auth_user_created on auth.users;

-- Create trigger for new user signup
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Update timestamp
create function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger on_profile_updated
  before update on profiles
  for each row execute procedure public.handle_updated_at();

-- Add indexes for performance
create index idx_profiles_stripe_customer_id on profiles(stripe_customer_id);
create index idx_profiles_subscription_status on profiles(subscription_status);
create index idx_profiles_subscription_tier on profiles(subscription_tier);

-- Add admin policy for webhook updates
create policy "Service role can update all profiles"
  on profiles for update
  using (auth.role() = 'service_role');

-- Add admin policy for webhook updates
create policy "Allow webhook service to update profiles"
  on profiles for update
  using (auth.jwt() ->> 'role' = 'service_role')
  with check (auth.jwt() ->> 'role' = 'service_role');

-- Add index for webhook performance
create index idx_profiles_updated_at on profiles(updated_at);

-- Initial data
insert into storage.buckets (id, name)
values ('stripe-webhooks', 'stripe-webhooks')
on conflict do nothing;

-- Enable security definer on handle_new_user
revoke execute on function public.handle_new_user() from public;
grant execute on function public.handle_new_user() to postgres;
grant execute on function public.handle_new_user() to service_role;
