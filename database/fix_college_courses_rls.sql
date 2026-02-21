-- =====================================================
-- FIX: College Courses RLS Policies
-- =====================================================
-- Run this in Supabase SQL Editor to fix permission issues

-- Drop existing policies
DROP POLICY IF EXISTS "Public can view college courses" ON college_courses;
DROP POLICY IF EXISTS "Authenticated users can insert college courses" ON college_courses;
DROP POLICY IF EXISTS "Authenticated users can delete college courses" ON college_courses;

-- Create new policies that allow PUBLIC read access
CREATE POLICY "Public can view college courses" ON college_courses
  FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can insert college courses" ON college_courses
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete college courses" ON college_courses
  FOR DELETE
  USING (auth.role() = 'authenticated');

-- Also ensure courses table has proper read access
DROP POLICY IF EXISTS "Public can view courses" ON courses;

CREATE POLICY "Public can view courses" ON courses
  FOR SELECT
  USING (true);
