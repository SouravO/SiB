-- Add RLS policies to existing user_profiles table
-- Run this in Supabase SQL Editor

-- Enable Row Level Security (if not already enabled)
alter table user_profiles enable row level security;

-- Drop existing policies if they exist
drop policy if exists "Users can view their own profile" on user_profiles;
drop policy if exists "Admins can view all profiles" on user_profiles;
drop policy if exists "Service role can do anything" on user_profiles;

-- Policy: Users can view their own profile
create policy "Users can view their own profile"
  on user_profiles for select
  using ( auth.uid() = id );

-- Policy: Admins can view all profiles
create policy "Admins can view all profiles"
  on user_profiles for select
  using ( 
    exists (
      select 1 from user_profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- Policy: Service role can do anything (for server actions with service_role key)
create policy "Service role can do anything"
  on user_profiles
  using ( auth.jwt() ->> 'role' = 'service_role' );

-- Create indexes for better performance (if they don't exist)
create index if not exists user_profiles_role_idx on user_profiles(role);
create index if not exists user_profiles_email_idx on user_profiles(email);
