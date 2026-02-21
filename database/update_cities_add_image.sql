-- Add image_url column to cities table if it doesn't exist
ALTER TABLE cities
ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Add comment for documentation
COMMENT ON COLUMN cities.image_url IS 'URL to city image stored in Cloudinary';

-- Ensure RLS policies allow updates to image_url
-- First, enable RLS if not already enabled
ALTER TABLE cities ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Public can view cities" ON cities;
DROP POLICY IF EXISTS "Authenticated users can insert cities" ON cities;
DROP POLICY IF EXISTS "Authenticated users can update cities" ON cities;
DROP POLICY IF EXISTS "Authenticated users can delete cities" ON cities;

-- Create new RLS policies
CREATE POLICY "Public can view cities" ON cities
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert cities" ON cities
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update cities" ON cities
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete cities" ON cities
  FOR DELETE USING (auth.role() = 'authenticated');
