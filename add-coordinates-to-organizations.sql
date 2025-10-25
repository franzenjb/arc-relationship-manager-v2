-- Add latitude and longitude columns to organizations table for geocoding
ALTER TABLE organizations 
ADD COLUMN latitude DECIMAL(10, 8),
ADD COLUMN longitude DECIMAL(11, 8);

-- Add index for spatial queries (if needed later)
CREATE INDEX idx_organizations_coordinates ON organizations(latitude, longitude) WHERE latitude IS NOT NULL AND longitude IS NOT NULL;

-- Add comment for documentation
COMMENT ON COLUMN organizations.latitude IS 'Geocoded latitude coordinate for mapping';
COMMENT ON COLUMN organizations.longitude IS 'Geocoded longitude coordinate for mapping';