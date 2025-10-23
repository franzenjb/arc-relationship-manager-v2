-- COMPLETE SCHEMA FIX - Apply all missing tables and columns
-- This script will bring the database schema up to the expected state

-- Enable required extensions (if not already enabled)
CREATE EXTENSION IF NOT EXISTS "postgis";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- CREATE MISSING GEOGRAPHIC TABLES
-- =============================================

-- Create regions table
CREATE TABLE IF NOT EXISTS regions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  code TEXT UNIQUE NOT NULL,
  geom GEOMETRY(MULTIPOLYGON, 4326),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create chapters table
CREATE TABLE IF NOT EXISTS chapters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  region_id UUID REFERENCES regions(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  code TEXT UNIQUE NOT NULL,
  geom GEOMETRY(MULTIPOLYGON, 4326),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create counties table
CREATE TABLE IF NOT EXISTS counties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chapter_id UUID REFERENCES chapters(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  state_code TEXT NOT NULL,
  fips_code TEXT UNIQUE NOT NULL,
  geom GEOMETRY(MULTIPOLYGON, 4326),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- ADD MISSING COLUMNS TO ORGANIZATIONS TABLE
-- =============================================

-- Add geographic relationship columns
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS region_id UUID REFERENCES regions(id);
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS chapter_id UUID REFERENCES chapters(id);

-- Add location and geometry column
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS location GEOMETRY(POINT, 4326);

-- Add tags array column
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS tags TEXT[];

-- Add audit columns
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id);
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS updated_by UUID REFERENCES auth.users(id);

-- Add search vector (generated column)
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS search_vector TSVECTOR GENERATED ALWAYS AS (
  to_tsvector('english', COALESCE(name, '') || ' ' || COALESCE(notes, '') || ' ' || COALESCE(address, ''))
) STORED;

-- Add relationship_managers JSON column
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS relationship_managers JSONB DEFAULT '[]'::jsonb;

-- =============================================
-- ADD MISSING COLUMNS TO PEOPLE TABLE
-- =============================================

-- Add audit columns
ALTER TABLE people ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id);
ALTER TABLE people ADD COLUMN IF NOT EXISTS updated_by UUID REFERENCES auth.users(id);

-- Add search vector (generated column)
ALTER TABLE people ADD COLUMN IF NOT EXISTS search_vector TSVECTOR GENERATED ALWAYS AS (
  to_tsvector('english', COALESCE(first_name, '') || ' ' || COALESCE(last_name, '') || ' ' || 
                        COALESCE(title, '') || ' ' || COALESCE(email, '') || ' ' || COALESCE(notes, ''))
) STORED;

-- =============================================
-- ADD MISSING COLUMNS TO MEETINGS TABLE
-- =============================================

-- Add attendees array column
ALTER TABLE meetings ADD COLUMN IF NOT EXISTS attendees UUID[];

-- Add audit columns
ALTER TABLE meetings ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id);
ALTER TABLE meetings ADD COLUMN IF NOT EXISTS updated_by UUID REFERENCES auth.users(id);

-- Add search vector (generated column)
ALTER TABLE meetings ADD COLUMN IF NOT EXISTS search_vector TSVECTOR GENERATED ALWAYS AS (
  to_tsvector('english', COALESCE(summary, '') || ' ' || COALESCE(location, ''))
) STORED;

-- =============================================
-- CREATE MISSING TABLES
-- =============================================

-- Create attachments table
CREATE TABLE IF NOT EXISTS attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meeting_id UUID REFERENCES meetings(id) ON DELETE CASCADE,
  storage_path TEXT NOT NULL,
  file_name TEXT,
  mime_type TEXT,
  uploaded_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create user profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role TEXT DEFAULT 'chapter_user' CHECK (role IN ('national_admin', 'regional_lead', 'chapter_user', 'read_only')),
  region_id UUID REFERENCES regions(id),
  chapter_id UUID REFERENCES chapters(id),
  first_name TEXT,
  last_name TEXT,
  notifications_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create activity log table
CREATE TABLE IF NOT EXISTS activity_log (
  id BIGSERIAL PRIMARY KEY,
  actor_user_id UUID REFERENCES auth.users(id),
  entity_type TEXT NOT NULL CHECK (entity_type IN ('organization', 'person', 'meeting', 'attachment')),
  entity_id UUID NOT NULL,
  action TEXT NOT NULL CHECK (action IN ('created', 'updated', 'deleted')),
  payload JSONB,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- Create relationship managers table (alternative to JSON column)
CREATE TABLE IF NOT EXISTS relationship_managers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id)
);

-- =============================================
-- CREATE MISSING INDEXES
-- =============================================

-- Organizations indexes
CREATE INDEX IF NOT EXISTS organizations_search_idx ON organizations USING GIN (search_vector);
CREATE INDEX IF NOT EXISTS organizations_location_idx ON organizations USING GIST (location);
CREATE INDEX IF NOT EXISTS organizations_region_idx ON organizations (region_id);
CREATE INDEX IF NOT EXISTS organizations_chapter_idx ON organizations (chapter_id);
CREATE INDEX IF NOT EXISTS organizations_county_idx ON organizations (county_id);
CREATE INDEX IF NOT EXISTS organizations_status_idx ON organizations (status);
CREATE INDEX IF NOT EXISTS organizations_mission_area_idx ON organizations (mission_area);
CREATE INDEX IF NOT EXISTS organizations_updated_at_idx ON organizations (updated_at);

-- People indexes
CREATE INDEX IF NOT EXISTS people_search_idx ON people USING GIN (search_vector);
CREATE INDEX IF NOT EXISTS people_org_idx ON people (org_id);
CREATE INDEX IF NOT EXISTS people_email_idx ON people (email);

-- Meetings indexes
CREATE INDEX IF NOT EXISTS meetings_search_idx ON meetings USING GIN (search_vector);
CREATE INDEX IF NOT EXISTS meetings_org_idx ON meetings (org_id);
CREATE INDEX IF NOT EXISTS meetings_date_idx ON meetings (date);
CREATE INDEX IF NOT EXISTS meetings_follow_up_date_idx ON meetings (follow_up_date);

-- Geographic indexes
CREATE INDEX IF NOT EXISTS counties_geom_idx ON counties USING GIST (geom);
CREATE INDEX IF NOT EXISTS chapters_geom_idx ON chapters USING GIST (geom);
CREATE INDEX IF NOT EXISTS regions_geom_idx ON regions USING GIST (geom);

-- Activity log indexes
CREATE INDEX IF NOT EXISTS activity_log_entity_idx ON activity_log (entity_type, entity_id);
CREATE INDEX IF NOT EXISTS activity_log_timestamp_idx ON activity_log (timestamp);
CREATE INDEX IF NOT EXISTS activity_log_actor_idx ON activity_log (actor_user_id);

-- Relationship managers indexes
CREATE INDEX IF NOT EXISTS relationship_managers_org_idx ON relationship_managers (organization_id);
CREATE INDEX IF NOT EXISTS relationship_managers_email_idx ON relationship_managers (email);

-- =============================================
-- CREATE TRIGGER FUNCTIONS
-- =============================================

-- Function for updating updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function for activity logging
CREATE OR REPLACE FUNCTION log_activity()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO activity_log (actor_user_id, entity_type, entity_id, action, payload)
  VALUES (
    auth.uid(),
    TG_TABLE_NAME::TEXT,
    COALESCE(NEW.id, OLD.id),
    LOWER(TG_OP),
    CASE 
      WHEN TG_OP = 'DELETE' THEN to_jsonb(OLD)
      ELSE to_jsonb(NEW)
    END
  );
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- CREATE TRIGGERS
-- =============================================

-- Updated_at triggers
DROP TRIGGER IF EXISTS update_organizations_updated_at ON organizations;
CREATE TRIGGER update_organizations_updated_at 
  BEFORE UPDATE ON organizations 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_people_updated_at ON people;
CREATE TRIGGER update_people_updated_at 
  BEFORE UPDATE ON people 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_meetings_updated_at ON meetings;
CREATE TRIGGER update_meetings_updated_at 
  BEFORE UPDATE ON meetings 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON user_profiles;
CREATE TRIGGER update_user_profiles_updated_at 
  BEFORE UPDATE ON user_profiles 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_relationship_managers_updated_at ON relationship_managers;
CREATE TRIGGER update_relationship_managers_updated_at 
  BEFORE UPDATE ON relationship_managers 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Activity logging triggers
DROP TRIGGER IF EXISTS log_organizations_activity ON organizations;
CREATE TRIGGER log_organizations_activity
  AFTER INSERT OR UPDATE OR DELETE ON organizations
  FOR EACH ROW EXECUTE FUNCTION log_activity();

DROP TRIGGER IF EXISTS log_people_activity ON people;
CREATE TRIGGER log_people_activity
  AFTER INSERT OR UPDATE OR DELETE ON people
  FOR EACH ROW EXECUTE FUNCTION log_activity();

DROP TRIGGER IF EXISTS log_meetings_activity ON meetings;
CREATE TRIGGER log_meetings_activity
  AFTER INSERT OR UPDATE OR DELETE ON meetings
  FOR EACH ROW EXECUTE FUNCTION log_activity();

-- =============================================
-- INSERT SAMPLE DATA
-- =============================================

-- Insert sample regions (only if they don't exist)
INSERT INTO regions (id, name, code) 
SELECT * FROM (VALUES
  ('550e8400-e29b-41d4-a716-446655440000'::UUID, 'National Capital & Greater Chesapeake', 'NCGC'),
  ('550e8400-e29b-41d4-a716-446655440001'::UUID, 'Northern California Coastal', 'NCC'),
  ('550e8400-e29b-41d4-a716-446655440002'::UUID, 'Southern California', 'SCA'),
  ('550e8400-e29b-41d4-a716-446655440003'::UUID, 'Texas Gulf Coast', 'TGC')
) AS v(id, name, code)
WHERE NOT EXISTS (SELECT 1 FROM regions WHERE code = v.code);

-- Insert sample chapters (only if they don't exist)
INSERT INTO chapters (id, region_id, name, code)
SELECT * FROM (VALUES
  ('550e8400-e29b-41d4-a716-446655440010'::UUID, '550e8400-e29b-41d4-a716-446655440000'::UUID, 'Washington DC Metro', 'DCM'),
  ('550e8400-e29b-41d4-a716-446655440011'::UUID, '550e8400-e29b-41d4-a716-446655440001'::UUID, 'San Francisco Bay Area', 'SFBA'),
  ('550e8400-e29b-41d4-a716-446655440012'::UUID, '550e8400-e29b-41d4-a716-446655440002'::UUID, 'Los Angeles', 'LA'),
  ('550e8400-e29b-41d4-a716-446655440013'::UUID, '550e8400-e29b-41d4-a716-446655440003'::UUID, 'Houston', 'HOU')
) AS v(id, region_id, name, code)
WHERE NOT EXISTS (SELECT 1 FROM chapters WHERE code = v.code);

-- Insert sample counties (only if they don't exist)
INSERT INTO counties (id, chapter_id, name, state_code, fips_code)
SELECT * FROM (VALUES
  ('550e8400-e29b-41d4-a716-446655440020'::UUID, '550e8400-e29b-41d4-a716-446655440010'::UUID, 'Montgomery County', 'MD', '24031'),
  ('550e8400-e29b-41d4-a716-446655440021'::UUID, '550e8400-e29b-41d4-a716-446655440010'::UUID, 'Fairfax County', 'VA', '51059'),
  ('550e8400-e29b-41d4-a716-446655440022'::UUID, '550e8400-e29b-41d4-a716-446655440011'::UUID, 'San Francisco County', 'CA', '06075'),
  ('550e8400-e29b-41d4-a716-446655440023'::UUID, '550e8400-e29b-41d4-a716-446655440012'::UUID, 'Los Angeles County', 'CA', '06037')
) AS v(id, chapter_id, name, state_code, fips_code)
WHERE NOT EXISTS (SELECT 1 FROM counties WHERE fips_code = v.fips_code);

-- =============================================
-- ENABLE ROW LEVEL SECURITY
-- =============================================

-- Enable RLS on all tables
ALTER TABLE regions ENABLE ROW LEVEL SECURITY;
ALTER TABLE chapters ENABLE ROW LEVEL SECURITY;
ALTER TABLE counties ENABLE ROW LEVEL SECURITY;
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE people ENABLE ROW LEVEL SECURITY;
ALTER TABLE meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE relationship_managers ENABLE ROW LEVEL SECURITY;

-- NOTE: RLS policies should be created separately based on authentication requirements

COMMIT;