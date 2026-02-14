-- Update colleges table with new columns
ALTER TABLE colleges
ADD COLUMN IF NOT EXISTS short_description TEXT,
ADD COLUMN IF NOT EXISTS long_description TEXT,
ADD COLUMN IF NOT EXISTS brochure_url TEXT,
ADD COLUMN IF NOT EXISTS specialization TEXT;

-- Create college_images table for multiple photos
CREATE TABLE IF NOT EXISTS college_images (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  college_id UUID REFERENCES colleges(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  cloudinary_public_id TEXT,
  caption TEXT,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create college_videos table for videos
CREATE TABLE IF NOT EXISTS college_videos (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  college_id UUID REFERENCES colleges(id) ON DELETE CASCADE,
  video_url TEXT NOT NULL,
  cloudinary_public_id TEXT,
  title TEXT,
  platform TEXT CHECK (platform IN ('youtube', 'vimeo', 'cloudinary', 'other')),
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_college_images_college_id ON college_images(college_id);
CREATE INDEX IF NOT EXISTS idx_college_videos_college_id ON college_videos(college_id);

-- Add RLS policies for college_images
ALTER TABLE college_images ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view college images" ON college_images
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert college images" ON college_images
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update college images" ON college_images
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete college images" ON college_images
  FOR DELETE USING (auth.role() = 'authenticated');

-- Add RLS policies for college_videos
ALTER TABLE college_videos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view college videos" ON college_videos
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert college videos" ON college_videos
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update college videos" ON college_videos
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete college videos" ON college_videos
  FOR DELETE USING (auth.role() = 'authenticated');
