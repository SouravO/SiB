# Database Setup Guide

## Setting Up the Profiles Table

To enable user management functionality, you need to create the `profiles` table in your Supabase database.

### Quick Setup

1. **Open Supabase SQL Editor**:
   - Go to your Supabase project dashboard
   - Click on **SQL Editor** in the left sidebar
   - Click **New query**

2. **Run the Setup Script**:
   - Copy the entire contents of `database/setup_profiles.sql`
   - Paste it into the SQL editor
   - Click **Run** or press `Ctrl/Cmd + Enter`

3. **Verify the Table**:
   - Go to **Table Editor** in the left sidebar
   - You should see the `profiles` table
   - Check that it has the following columns:
     - `id` (uuid, primary key)
     - `email` (text)
     - `role` (text)
     - `full_name` (text)
     - `created_at` (timestamp)
     - `updated_at` (timestamp)

### What the Script Does

The setup script creates:

1. **Profiles Table**: Stores user profile information and roles
2. **Row Level Security (RLS) Policies**:
   - Users can view and update their own profile
   - Admins can view, create, update, and delete all profiles
3. **Triggers**:
   - Automatically updates `updated_at` timestamp on profile changes
   - Automatically creates a profile when a new user signs up
4. **Indexes**: For faster queries on `role` and `email` columns

### Creating Your First Admin User

After setting up the table, you need to create your first admin user manually:

#### Option 1: Via Supabase Dashboard

1. **Create Auth User**:
   - Go to **Authentication** → **Users**
   - Click **Add user** → **Create new user**
   - Enter your email and password
   - Check "Auto Confirm User"
   - Click **Create user**
   - **Copy the User ID** (you'll need it in the next step)

2. **Create Admin Profile**:
   - Go to **Table Editor** → **profiles**
   - Click **Insert** → **Insert row**
   - Fill in:
     - `id`: Paste the User ID from step 1
     - `email`: Your email
     - `role`: `admin`
     - `full_name`: Your name (optional)
   - Click **Save**

#### Option 2: Via SQL

Run this SQL in the SQL Editor (replace with your details):

```sql
-- First, create the auth user and get the ID
-- You'll need to do this in the Supabase dashboard first, then use the ID here

-- Insert admin profile (replace the UUID with your user's ID)
insert into profiles (id, email, role, full_name)
values (
  'your-user-id-here',
  'your-email@example.com',
  'admin',
  'Your Name'
);
```

### Testing the Setup

1. **Login**: Use your admin credentials to log in
2. **Access Dashboard**: You should see the admin dashboard with user management
3. **Create a Test User**: Click "Create New User" and create a test user
4. **Verify**: Check that the new user appears in both:
   - The dashboard user list
   - Supabase **Authentication** → **Users**
   - Supabase **Table Editor** → **profiles**

### Troubleshooting

**Error: "relation 'profiles' does not exist"**
- Make sure you ran the setup SQL script
- Refresh the Supabase dashboard

**Error: "permission denied for table profiles"**
- Check that RLS policies were created correctly
- Verify your user has an admin role in the profiles table

**Users not appearing in the list**
- Make sure you added the service_role key to `.env.local`
- Restart your dev server after adding the key
- Check the browser console for errors

**Can't create users**
- Verify the service_role key is correct
- Check that the profiles table exists
- Look for errors in the server console

### Security Notes

- The `service_role` key bypasses RLS, so it should only be used server-side
- Never expose the service_role key to the client
- RLS policies ensure users can only see/edit their own data (unless they're admins)
- The automatic profile creation trigger ensures every auth user has a profile

## Next Steps

Once the database is set up:
1. Add your service_role key to `.env.local`
2. Restart your dev server
3. Create your first admin user
4. Log in and start managing users!
