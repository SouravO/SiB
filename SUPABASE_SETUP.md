# Supabase Setup Guide

This document explains how to set up and configure Supabase for your Next.js application.

## Prerequisites

- A Supabase account (sign up at [https://supabase.com](https://supabase.com))
- Node.js and npm installed

## Step 1: Create a Supabase Project

1. Go to [https://app.supabase.com](https://app.supabase.com)
2. Click "New Project"
3. Fill in your project details:
   - **Name**: Choose a name for your project
   - **Database Password**: Create a strong password (save this!)
   - **Region**: Choose the region closest to your users
4. Click "Create new project"
5. Wait for the project to be set up (this may take a few minutes)

## Step 2: Get Your API Credentials

1. In your Supabase project dashboard, click on the **Settings** icon (gear icon) in the sidebar
2. Select **API** from the settings menu
3. You'll see two important values:
   - **Project URL**: This is your `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public**: This is your `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Step 3: Configure Environment Variables

1. Open `.env.local` in your project root
2. Replace the placeholder values with your actual credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-actual-anon-key-here
```

> **Important**: Never commit `.env.local` to version control. It's already in `.gitignore`.

## Step 4: Set Up Authentication

### Enable Email Authentication

1. In your Supabase dashboard, go to **Authentication** → **Providers**
2. Find **Email** in the list
3. Make sure it's **enabled** (it should be by default)
4. Configure settings:
   - **Enable email confirmations**: Toggle based on your needs
   - If disabled, users can sign in immediately without email verification
   - If enabled, users must verify their email before signing in

### Create a Test User

You have two options:

**Option A: Sign up through the app** (if you implement a signup page)

**Option B: Create user manually in dashboard**
1. Go to **Authentication** → **Users** in your Supabase dashboard
2. Click **Add user** → **Create new user**
3. Enter:
   - Email address
   - Password
   - Auto Confirm User: ✓ (recommended for testing)
4. Click **Create user**

## Step 5: Test the Authentication

1. Make sure your dev server is running:
   ```bash
   npm run dev
   ```

2. Navigate to `http://localhost:3000/login`

3. Try logging in with your test user credentials

4. If successful, you should be redirected to the home page

## Optional: Configure OAuth Providers

### Google OAuth

1. Go to **Authentication** → **Providers** in Supabase
2. Find **Google** and click to expand
3. Toggle **Enable Sign in with Google**
4. Follow the instructions to:
   - Create a Google Cloud project
   - Set up OAuth 2.0 credentials
   - Add the redirect URLs provided by Supabase
5. Copy your Google Client ID and Secret into Supabase

### GitHub OAuth

1. Go to **Authentication** → **Providers** in Supabase
2. Find **GitHub** and click to expand
3. Toggle **Enable Sign in with GitHub**
4. Follow the instructions to:
   - Create a GitHub OAuth App
   - Set the authorization callback URL
5. Copy your GitHub Client ID and Secret into Supabase

## Database Schema (Optional)

If you want to store additional user profile data, you can create a `profiles` table:

```sql
-- Create a table for user profiles
create table profiles (
  id uuid references auth.users on delete cascade not null primary key,
  updated_at timestamp with time zone,
  username text unique,
  full_name text,
  avatar_url text,

  constraint username_length check (char_length(username) >= 3)
);

-- Set up Row Level Security (RLS)
alter table profiles enable row level security;

-- Allow users to read their own profile
create policy "Users can view their own profile"
  on profiles for select
  using ( auth.uid() = id );

-- Allow users to update their own profile
create policy "Users can update their own profile"
  on profiles for update
  using ( auth.uid() = id );

-- Create a trigger to automatically create a profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id)
  values (new.id);
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
```

## Troubleshooting

### "Invalid login credentials"
- Double-check your email and password
- Make sure the user exists in **Authentication** → **Users**
- If email confirmation is enabled, make sure the user's email is verified

### Environment variables not loading
- Make sure `.env.local` is in your project root
- Restart your dev server after changing environment variables
- Check that variable names start with `NEXT_PUBLIC_`

### CORS errors
- Make sure your Supabase project URL is correct
- Check that you're using the anonymous key, not the service role key
- Verify your site URL in Supabase settings

## Security Best Practices

1. **Never expose your service_role key** - only use it in secure server environments
2. **Use Row Level Security (RLS)** on all database tables
3. **Enable email verification** for production apps
4. **Set up proper password policies** in Authentication settings
5. **Monitor authentication logs** regularly in the Supabase dashboard

## Next Steps

- Implement a sign-up page
- Add password reset functionality
- Create protected routes
- Set up user profiles
- Add social authentication

## Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Auth Helpers for Next.js](https://supabase.com/docs/guides/auth/auth-helpers/nextjs)
- [Next.js App Router Guide](https://nextjs.org/docs/app)
