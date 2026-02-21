-- =====================================================
-- COURSES TABLE SETUP WITH DATA FROM courses.json
-- =====================================================
-- Run this entire script in Supabase SQL Editor to:
-- 1. Create the courses table
-- 2. Create the college_courses junction table
-- 3. Insert all 50 courses from courses.json
-- =====================================================

-- Create courses table
CREATE TABLE IF NOT EXISTS courses (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  category TEXT NOT NULL,
  degree TEXT NOT NULL,
  duration_years DECIMAL(3,1) NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create college_courses junction table (many-to-many relationship)
CREATE TABLE IF NOT EXISTS college_courses (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  college_id UUID REFERENCES colleges(id) ON DELETE CASCADE,
  course_id TEXT REFERENCES courses(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(college_id, course_id)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_courses_category ON courses(category);
CREATE INDEX IF NOT EXISTS idx_courses_degree ON courses(degree);
CREATE INDEX IF NOT EXISTS idx_courses_slug ON courses(slug);
CREATE INDEX IF NOT EXISTS idx_college_courses_college_id ON college_courses(college_id);
CREATE INDEX IF NOT EXISTS idx_college_courses_course_id ON college_courses(course_id);

-- Enable RLS
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE college_courses ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Public can view courses" ON courses;
DROP POLICY IF EXISTS "Authenticated users can insert courses" ON courses;
DROP POLICY IF EXISTS "Authenticated users can update courses" ON courses;
DROP POLICY IF EXISTS "Authenticated users can delete courses" ON courses;

DROP POLICY IF EXISTS "Public can view college courses" ON college_courses;
DROP POLICY IF EXISTS "Authenticated users can insert college courses" ON college_courses;
DROP POLICY IF EXISTS "Authenticated users can delete college courses" ON college_courses;

-- Create RLS policies for courses
CREATE POLICY "Public can view courses" ON courses
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert courses" ON courses
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update courses" ON courses
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete courses" ON courses
  FOR DELETE USING (auth.role() = 'authenticated');

-- Create RLS policies for college_courses
CREATE POLICY "Public can view college courses" ON college_courses
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert college courses" ON college_courses
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete college courses" ON college_courses
  FOR DELETE USING (auth.role() = 'authenticated');

-- Insert courses from courses.json
-- Each course is categorized based on its name
INSERT INTO courses (id, name, slug, category, degree, duration_years) VALUES
  ('01', 'BSC', 'bsc', 'Science', 'B.Sc', 3),
  ('02', 'BBA', 'bba', 'Management', 'BBA', 3),
  ('03', 'BCOM', 'bcom', 'Commerce', 'B.Com', 3),
  ('04', 'BCA', 'bca', 'Computer Applications', 'BCA', 3),
  ('05', 'MBA', 'mba', 'Management', 'MBA', 2),
  ('06', 'MCA', 'mca', 'Computer Applications', 'MCA', 3),
  ('07', 'B.Tech Computer Science', 'btech-computer-science', 'Engineering', 'B.Tech', 4),
  ('08', 'B.Tech Information Science', 'btech-information-science', 'Engineering', 'B.Tech', 4),
  ('09', 'B.Tech Electronics & Communication', 'btech-electronics-and-communication', 'Engineering', 'B.Tech', 4),
  ('10', 'B.Tech Mechanical Engineering', 'btech-mechanical-engineering', 'Engineering', 'B.Tech', 4),
  ('11', 'B.Tech Civil Engineering', 'btech-civil-engineering', 'Engineering', 'B.Tech', 4),
  ('12', 'B.Tech Electrical & Electronics', 'btech-electrical-and-electronics', 'Engineering', 'B.Tech', 4),
  ('13', 'B.Tech Telecommunication', 'btech-telecommunication', 'Engineering', 'B.Tech', 4),
  ('14', 'B.Tech Biotechnology', 'btech-biotechnology', 'Engineering', 'B.Tech', 4),
  ('15', 'B.Tech AI & Machine Learning', 'btech-ai-and-machine-learning', 'Engineering', 'B.Tech', 4),
  ('16', 'B.Tech Data Science', 'btech-data-science', 'Engineering', 'B.Tech', 4),
  ('17', 'B.E Computer Science (AI & ML)', 'be-computer-science-ai-and-ml', 'Engineering', 'B.E', 4),
  ('18', 'M.Tech', 'mtech', 'Engineering', 'M.Tech', 2),
  ('19', 'M.E', 'me', 'Engineering', 'M.E', 2),
  ('20', 'Diploma in Engineering', 'diploma-in-engineering', 'Engineering', 'Diploma', 3),
  ('21', 'MBBS', 'mbbs', 'Medical', 'MBBS', 5.5),
  ('22', 'BDS', 'bds', 'Medical', 'BDS', 5),
  ('23', 'B.Sc Nursing', 'bsc-nursing', 'Medical', 'B.Sc Nursing', 4),
  ('24', 'B.Pharm', 'bpharm', 'Pharmacy', 'B.Pharm', 4),
  ('25', 'M.Pharm', 'mpharm', 'Pharmacy', 'M.Pharm', 2),
  ('26', 'MD', 'md', 'Medical', 'MD', 3),
  ('27', 'MS', 'ms', 'Medical', 'MS', 3),
  ('28', 'BPT', 'bpt', 'Medical', 'BPT', 4.5),
  ('29', 'MPT', 'mpt', 'Medical', 'MPT', 2),
  ('30', 'BHM', 'bhm', 'Hospitality', 'BHM', 4),
  ('31', 'MHM', 'mhm', 'Hospitality', 'MHM', 2),
  ('32', 'B.Des', 'bdes', 'Design', 'B.Des', 4),
  ('33', 'M.Des', 'mdes', 'Design', 'M.Des', 2),
  ('34', 'B.F.Tech', 'bftech', 'Fashion', 'B.F.Tech', 4),
  ('35', 'M.F.Tech', 'mfttech', 'Fashion', 'M.F.Tech', 2),
  ('36', 'B.Arch', 'barch', 'Architecture', 'B.Arch', 5),
  ('37', 'M.Arch', 'march', 'Architecture', 'M.Arch', 2),
  ('38', 'B.Plan', 'bplan', 'Architecture', 'B.Plan', 4),
  ('39', 'M.Plan', 'mplan', 'Architecture', 'M.Plan', 2),
  ('40', 'LLB', 'llb', 'Law', 'LLB', 3),
  ('41', 'LLM', 'llm', 'Law', 'LLM', 2),
  ('42', 'B.Ed', 'bed', 'Education', 'B.Ed', 2),
  ('43', 'M.Ed', 'med', 'Education', 'M.Ed', 2),
  ('44', 'Ph.D', 'phd', 'Research', 'Ph.D', 3),
  ('45', 'MCA (Data Science)', 'mca-data-science', 'Computer Applications', 'MCA', 3),
  ('46', 'M.Com', 'mcom', 'Commerce', 'M.Com', 2),
  ('47', 'M.Sc', 'msc', 'Science', 'M.Sc', 2),
  ('48', 'B.A', 'ba', 'Arts', 'B.A', 3),
  ('49', 'M.A', 'ma', 'Arts', 'M.A', 2),
  ('50', 'B.Sc', 'bsc-2', 'Science', 'B.Sc', 3)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  slug = EXCLUDED.slug,
  category = EXCLUDED.category,
  degree = EXCLUDED.degree,
  duration_years = EXCLUDED.duration_years;

-- Verify the insertion
SELECT COUNT(*) as total_courses FROM courses;
