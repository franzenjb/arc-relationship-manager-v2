-- Manual Database Setup for Relationship Managers
-- Run this SQL directly in your Supabase SQL editor

-- Remove old primary_contact_id from organizations (if it exists)
ALTER TABLE organizations DROP COLUMN IF EXISTS primary_contact_id;

-- Create relationship managers table
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

-- Create indexes
CREATE INDEX IF NOT EXISTS relationship_managers_org_idx ON relationship_managers (organization_id);
CREATE INDEX IF NOT EXISTS relationship_managers_email_idx ON relationship_managers (email);

-- Add trigger for updated_at
CREATE TRIGGER IF NOT EXISTS update_relationship_managers_updated_at 
  BEFORE UPDATE ON relationship_managers 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Add missing audit fields to people table (from previous migration)
ALTER TABLE people 
ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS updated_by UUID REFERENCES auth.users(id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS people_created_by_idx ON people (created_by);
CREATE INDEX IF NOT EXISTS people_updated_by_idx ON people (updated_by);

-- Add trigger for updated_at to people if it doesn't exist
CREATE TRIGGER IF NOT EXISTS update_people_updated_at 
  BEFORE UPDATE ON people 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Verify tables exist
SELECT 'relationship_managers table created successfully' as status
WHERE EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'relationship_managers');

SELECT 'people table audit fields added successfully' as status  
WHERE EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'people' AND column_name = 'created_by');