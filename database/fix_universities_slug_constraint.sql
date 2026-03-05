-- Drop the unique constraint on slug for universities table
-- Universities can have the same name in different cities, so slug alone shouldn't be unique

-- First, find and drop the unique constraint
ALTER TABLE universities
DROP CONSTRAINT IF EXISTS universities_slug_key;

-- Optionally, create a composite unique constraint on (slug, city_id) instead
-- This ensures uniqueness of university name within the same city
ALTER TABLE universities
ADD CONSTRAINT universities_slug_city_unique UNIQUE (slug, city_id);
