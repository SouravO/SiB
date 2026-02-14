-- Simple profiles table setup
-- Run this in Supabase SQL Editor

-- Create profiles table with basic columns
create table if not exists profiles (
  id uuid references auth.users on delete cascade not null primary key,
  email text,
  role text check (role in ('user', 'admin')) default 'user',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security
alter table profiles enable row level security;

-- Drop existing policies if they exist
drop policy if exists "Users can view their own profile" on profiles;
drop policy if exists "Admins can view all profiles" on profiles;
drop policy if exists "Service role can do anything" on profiles;

-- Policy: Users can view their own profile
create policy "Users can view their own profile"
  on profiles for select
  using ( auth.uid() = id );

-- Policy: Admins can view all profiles
create policy "Admins can view all profiles"
  on profiles for select
  using ( 
    exists (
      select 1 from profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- Policy: Allow service role to do everything (for server actions)
create policy "Service role can do anything"
  on profiles
  using ( auth.jwt() ->> 'role' = 'service_role' );

-- Create indexes for better performance
create index if not exists profiles_role_idx on profiles(role);
create index if not exists profiles_email_idx on profiles(email);
