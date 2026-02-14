-- Fix admin role and add super admin protection
-- Run this in Supabase SQL Editor

-- 1. Update studyinbengalurub2b@gmail.com to admin role in user_profiles
UPDATE user_profiles 
SET role = 'admin' 
WHERE email = 'studyinbengalurub2b@gmail.com';

-- 2. Also update in profiles table (in case it exists there)
UPDATE profiles 
SET role = 'admin' 
WHERE email = 'studyinbengalurub2b@gmail.com';

-- 3. Delete the duplicate entry from profiles table to avoid dual population
-- (Keep only user_profiles table)
DELETE FROM profiles 
WHERE email = 'studyinbengalurub2b@gmail.com';

-- 4. Verify the update
SELECT id, email, role, created_at 
FROM user_profiles 
WHERE email = 'studyinbengalurub2b@gmail.com';
