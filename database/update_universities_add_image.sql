-- Add image_url column to universities table if it doesn't exist
ALTER TABLE universities
ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Add comment for documentation
COMMENT ON COLUMN universities.image_url IS 'URL to university image stored in Cloudinary';

-- Ensure RLS policies allow updates to image_url
-- First, enable RLS if not already enabled
ALTER TABLE universities ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Public can view universities" ON universities;
DROP POLICY IF EXISTS "Authenticated users can insert universities" ON universities;
DROP POLICY IF EXISTS "Authenticated users can update universities" ON universities;
DROP POLICY IF EXISTS "Authenticated users can delete universities" ON universities;

-- Create new RLS policies
CREATE POLICY "Public can view universities" ON universities
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert universities" ON universities
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update universities" ON universities
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete universities" ON universities
  FOR DELETE USING (auth.role() = 'authenticated');
