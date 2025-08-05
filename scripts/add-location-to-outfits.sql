-- Add location fields to outfits table
ALTER TABLE outfits 
ADD COLUMN IF NOT EXISTS location_name TEXT,
ADD COLUMN IF NOT EXISTS location_lat DECIMAL(10, 8),
ADD COLUMN IF NOT EXISTS location_lng DECIMAL(11, 8),
ADD COLUMN IF NOT EXISTS url_google TEXT,
ADD COLUMN IF NOT EXISTS url_waze TEXT,
ADD COLUMN IF NOT EXISTS url_apple TEXT;

-- Create index for location queries
CREATE INDEX IF NOT EXISTS idx_outfits_location ON outfits(location_lat, location_lng);
