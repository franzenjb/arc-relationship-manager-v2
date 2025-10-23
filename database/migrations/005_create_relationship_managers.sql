-- Remove old primary_contact_id from organizations
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