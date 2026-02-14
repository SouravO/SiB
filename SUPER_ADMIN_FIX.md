# Quick Fix for Super Admin

## Problem
- `studyinbengalurub2b@gmail.com` showing as "user" instead of "admin"
- Need to make this account a protected super admin
- Duplicate entries in both `profiles` and `user_profiles` tables

## Solution

### Step 1: Run SQL to Fix Admin Role

Go to **Supabase Dashboard** → **SQL Editor** and run this:

```sql
-- Update to admin role in user_profiles
UPDATE user_profiles 
SET role = 'admin' 
WHERE email = 'studyinbengalurub2b@gmail.com';

-- Also update in profiles table (if it exists)
UPDATE profiles 
SET role = 'admin' 
WHERE email = 'studyinbengalurub2b@gmail.com';

-- Delete duplicate from profiles to avoid dual population
DELETE FROM profiles 
WHERE email = 'studyinbengalurub2b@gmail.com';

-- Verify the update
SELECT id, email, role, created_at 
FROM user_profiles 
WHERE email = 'studyinbengalurub2b@gmail.com';
```

### Step 2: Refresh Your Browser

After running the SQL:
1. Go back to `localhost:3000`
2. Refresh the page (Cmd+R or Ctrl+R)
3. You should now see:
   - `studyinbengalurub2b@gmail.com` with **admin** role badge
   - A yellow **"Super Admin"** badge next to it
   - **No delete button** for this account

## What Was Fixed

✅ **Super Admin Protection**: 
- `studyinbengalurub2b@gmail.com` is now hardcoded as super admin
- Cannot be deleted by anyone (no delete button shown)
- Shows yellow "Super Admin" badge

✅ **Admin Role Fixed**:
- SQL updates the role to 'admin' in database
- Dashboard will now show correct admin badge

✅ **Dual Table Issue**:
- Removed duplicate entry from `profiles` table
- Only `user_profiles` table is used now

## Testing

After the SQL update and refresh:
- [ ] Super admin shows "admin" role badge (purple)
- [ ] Super admin shows "Super Admin" badge (yellow)
- [ ] Super admin has NO delete button
- [ ] Other users still have delete buttons
- [ ] Can still create new users
- [ ] New users only appear in `user_profiles` table
