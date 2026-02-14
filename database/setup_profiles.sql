-- Create profiles table
create table if not exists profiles (
  id uuid references auth.users on delete cascade not null primary key,
  email text,
  role text check (role in ('user', 'admin')) default 'user',
  full_name text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security
alter table profiles enable row level security;

-- Drop existing policies if they exist
drop policy if exists "Users can view their own profile" on profiles;
drop policy if exists "Users can update their own profile" on profiles;
drop policy if exists "Admins can view all profiles" on profiles;
drop policy if exists "Admins can insert profiles" on profiles;
drop policy if exists "Admins can update all profiles" on profiles;
drop policy if exists "Admins can delete profiles" on profiles;

-- Policy: Users can view their own profile
create policy "Users can view their own profile"
  on profiles for select
  using ( auth.uid() = id );

-- Policy: Users can update their own profile
create policy "Users can update their own profile"
  on profiles for update
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

-- Policy: Admins can insert profiles (for user creation)
create policy "Admins can insert profiles"
  on profiles for insert
  with check (
    exists (
      select 1 from profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- Policy: Admins can update all profiles
create policy "Admins can update all profiles"
  on profiles for update
  using (
    exists (
      select 1 from profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- Policy: Admins can delete profiles
create policy "Admins can delete profiles"
  on profiles for delete
  using (
    exists (
      select 1 from profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- Create function to automatically update updated_at timestamp
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Create trigger to automatically update updated_at
drop trigger if exists update_profiles_updated_at on profiles;
create trigger update_profiles_updated_at
  before update on profiles
  for each row
  execute procedure update_updated_at_column();

-- Optional: Create a function to automatically create a profile when a user signs up
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, role)
  values (new.id, new.email, 'user');
  return new;
end;
$$ language plpgsql security definer;

-- Optional: Create trigger for automatic profile creation on signup
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Create an index on the role column for faster queries
create index if not exists profiles_role_idx on profiles(role);

-- Create an index on the email column for faster lookups
create index if not exists profiles_email_idx on profiles(email);
