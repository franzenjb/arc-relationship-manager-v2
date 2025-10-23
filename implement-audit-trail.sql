-- =============================================================================
-- AUDIT TRAIL IMPLEMENTATION
-- Add user profiles table and audit columns to all tables
-- =============================================================================

-- Create user_profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email text UNIQUE NOT NULL,
  first_name text,
  last_name text,
  role text DEFAULT 'chapter_user' CHECK (role IN ('national_admin', 'regional_lead', 'chapter_user', 'read_only')),
  region_id uuid,
  chapter_id uuid,
  notifications_enabled boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Add RLS (Row Level Security) policies
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own profile and admins can read all
CREATE POLICY "Users can view own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" ON user_profiles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() AND role = 'national_admin'
    )
  );

-- Add audit columns to organizations table
ALTER TABLE organizations 
ADD COLUMN IF NOT EXISTS created_by uuid REFERENCES user_profiles(id),
ADD COLUMN IF NOT EXISTS updated_by uuid REFERENCES user_profiles(id);

-- Add audit columns to people table  
ALTER TABLE people
ADD COLUMN IF NOT EXISTS created_by uuid REFERENCES user_profiles(id),
ADD COLUMN IF NOT EXISTS updated_by uuid REFERENCES user_profiles(id);

-- Add audit columns to meetings table
ALTER TABLE meetings
ADD COLUMN IF NOT EXISTS created_by uuid REFERENCES user_profiles(id),
ADD COLUMN IF NOT EXISTS updated_by uuid REFERENCES user_profiles(id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_organizations_created_by ON organizations(created_by);
CREATE INDEX IF NOT EXISTS idx_organizations_updated_by ON organizations(updated_by);
CREATE INDEX IF NOT EXISTS idx_people_created_by ON people(created_by);
CREATE INDEX IF NOT EXISTS idx_people_updated_by ON people(updated_by);
CREATE INDEX IF NOT EXISTS idx_meetings_created_by ON meetings(created_by);
CREATE INDEX IF NOT EXISTS idx_meetings_updated_by ON meetings(updated_by);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers for updated_at automation
CREATE TRIGGER update_organizations_updated_at 
  BEFORE UPDATE ON organizations 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_people_updated_at 
  BEFORE UPDATE ON people 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_meetings_updated_at 
  BEFORE UPDATE ON meetings 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_profiles_updated_at 
  BEFORE UPDATE ON user_profiles 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create a test user profile for demo purposes
INSERT INTO user_profiles (id, email, first_name, last_name, role) 
VALUES (
  'demo-user-uuid-0000-0000-000000000001'::uuid,
  'demo@redcross.org',
  'Demo',
  'User',
  'chapter_user'
) ON CONFLICT (id) DO NOTHING;

-- Add comments for documentation
COMMENT ON TABLE user_profiles IS 'User profiles with roles and permissions for audit trail';
COMMENT ON COLUMN organizations.created_by IS 'User who created this organization record';
COMMENT ON COLUMN organizations.updated_by IS 'User who last updated this organization record';
COMMENT ON COLUMN people.created_by IS 'User who created this person record';
COMMENT ON COLUMN people.updated_by IS 'User who last updated this person record';
COMMENT ON COLUMN meetings.created_by IS 'User who created this meeting record';
COMMENT ON COLUMN meetings.updated_by IS 'User who last updated this meeting record';