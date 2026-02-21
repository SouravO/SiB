-- Create courses table
CREATE TABLE IF NOT EXISTS courses (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
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
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
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

-- Insert default courses
INSERT INTO courses (name, slug, category, degree, duration_years) VALUES
  ('Computer Science and Engineering', 'computer-science-and-engineering', 'Engineering', 'B.Tech', 4),
  ('Information Science and Engineering', 'information-science-and-engineering', 'Engineering', 'B.Tech', 4),
  ('Electronics and Communication Engineering', 'electronics-and-communication-engineering', 'Engineering', 'B.Tech', 4),
  ('Mechanical Engineering', 'mechanical-engineering', 'Engineering', 'B.Tech', 4),
  ('Civil Engineering', 'civil-engineering', 'Engineering', 'B.Tech', 4),
  ('Electrical and Electronics Engineering', 'electrical-and-electronics-engineering', 'Engineering', 'B.Tech', 4),
  ('Telecommunication Engineering', 'telecommunication-engineering', 'Engineering', 'B.Tech', 4),
  ('Biotechnology', 'biotechnology', 'Engineering', 'B.Tech', 4),
  ('Artificial Intelligence and Machine Learning', 'artificial-intelligence-and-machine-learning', 'Engineering', 'B.Tech', 4),
  ('Data Science', 'data-science', 'Engineering', 'B.Tech', 4),
  ('Computer Science and Engineering (AI & ML)', 'cse-ai-ml', 'Engineering', 'B.E', 4),
  ('Master of Computer Applications', 'master-of-computer-applications', 'Computer Applications', 'MCA', 3),
  ('Bachelor of Computer Applications', 'bachelor-of-computer-applications', 'Computer Applications', 'BCA', 3),
  ('Master of Business Administration', 'master-of-business-administration', 'Management', 'MBA', 2),
  ('Bachelor of Business Administration', 'bachelor-of-business-administration', 'Management', 'BBA', 3),
  ('Master of Commerce', 'master-of-commerce', 'Commerce', 'M.Com', 2),
  ('Bachelor of Commerce', 'bachelor-of-commerce', 'Commerce', 'B.Com', 3),
  ('Bachelor of Science', 'bachelor-of-science', 'Science', 'B.Sc', 3),
  ('Master of Science', 'master-of-science', 'Science', 'M.Sc', 2),
  ('Bachelor of Arts', 'bachelor-of-arts', 'Arts', 'B.A', 3),
  ('Master of Arts', 'master-of-arts', 'Arts', 'M.A', 2),
  ('Bachelor of Engineering', 'bachelor-of-engineering', 'Engineering', 'B.E', 4),
  ('Master of Technology', 'master-of-technology', 'Engineering', 'M.Tech', 2),
  ('Master of Engineering', 'master-of-engineering', 'Engineering', 'M.E', 2),
  ('Diploma in Engineering', 'diploma-in-engineering', 'Engineering', 'Diploma', 3),
  ('Bachelor of Medicine and Bachelor of Surgery', 'mbbs', 'Medical', 'MBBS', 5.5),
  ('Bachelor of Dental Surgery', 'bachelor-of-dental-surgery', 'Medical', 'BDS', 5),
  ('Bachelor of Nursing', 'bachelor-of-nursing', 'Medical', 'B.Sc Nursing', 4),
  ('Bachelor of Pharmacy', 'bachelor-of-pharmacy', 'Pharmacy', 'B.Pharm', 4),
  ('Master of Pharmacy', 'master-of-pharmacy', 'Pharmacy', 'M.Pharm', 2),
  ('Doctor of Medicine', 'doctor-of-medicine', 'Medical', 'MD', 3),
  ('Master of Surgery', 'master-of-surgery', 'Medical', 'MS', 3),
  ('Bachelor of Physiotherapy', 'bachelor-of-physiotherapy', 'Medical', 'BPT', 4.5),
  ('Master of Physiotherapy', 'master-of-physiotherapy', 'Medical', 'MPT', 2),
  ('Bachelor of Hotel Management', 'bachelor-of-hotel-management', 'Hospitality', 'BHM', 4),
  ('Master of Hotel Management', 'master-of-hotel-management', 'Hospitality', 'MHM', 2),
  ('Bachelor of Design', 'bachelor-of-design', 'Design', 'B.Des', 4),
  ('Master of Design', 'master-of-design', 'Design', 'M.Des', 2),
  ('Bachelor of Fashion Technology', 'bachelor-of-fashion-technology', 'Fashion', 'B.F.Tech', 4),
  ('Master of Fashion Technology', 'master-of-fashion-technology', 'Fashion', 'M.F.Tech', 2),
  ('Bachelor of Architecture', 'bachelor-of-architecture', 'Architecture', 'B.Arch', 5),
  ('Master of Architecture', 'master-of-architecture', 'Architecture', 'M.Arch', 2),
  ('Bachelor of Planning', 'bachelor-of-planning', 'Architecture', 'B.Plan', 4),
  ('Master of Planning', 'master-of-planning', 'Architecture', 'M.Plan', 2),
  ('Bachelor of Laws', 'bachelor-of-laws', 'Law', 'LLB', 3),
  ('Master of Laws', 'master-of-laws', 'Law', 'LLM', 2),
  ('Bachelor of Education', 'bachelor-of-education', 'Education', 'B.Ed', 2),
  ('Master of Education', 'master-of-education', 'Education', 'M.Ed', 2),
  ('Doctor of Philosophy', 'doctor-of-philosophy', 'Research', 'Ph.D', 3),
  ('Master of Computer Applications (Data Science)', 'mca-data-science', 'Computer Applications', 'MCA', 3)
ON CONFLICT (slug) DO NOTHING;
