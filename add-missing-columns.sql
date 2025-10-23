-- Add missing columns to V2 to match V1 schema

-- Add missing columns to organizations table
ALTER TABLE organizations 
ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'active',
ADD COLUMN IF NOT EXISTS county_id UUID,
ADD COLUMN IF NOT EXISTS region_id UUID,
ADD COLUMN IF NOT EXISTS relationship_managers TEXT[] DEFAULT '{}';

-- Add any missing columns to people table (if needed)
-- V1 and V2 people tables should be mostly compatible

-- Add any missing columns to meetings table (if needed)
-- V1 and V2 meetings tables should be mostly compatible

-- Grant permissions
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'Added missing columns to match V1 schema';
END
$$;