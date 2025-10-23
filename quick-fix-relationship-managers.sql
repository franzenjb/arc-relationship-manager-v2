-- QUICK FIX: Create relationship_managers table
-- Run this in Supabase SQL Editor if relationship manager assignment is needed during demo

-- Create the relationship_managers table
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

-- Enable RLS
ALTER TABLE relationship_managers ENABLE ROW LEVEL SECURITY;

-- Create basic RLS policy (adjust as needed)
CREATE POLICY "Users can view all relationship managers" ON relationship_managers
  FOR SELECT USING (true);

CREATE POLICY "Users can insert relationship managers" ON relationship_managers
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update relationship managers" ON relationship_managers
  FOR UPDATE USING (true);

-- Insert sample relationship managers for demo
INSERT INTO relationship_managers (organization_id, name, email, phone, notes) VALUES
('00000000-0000-0000-0000-000000000001', 'Sarah Johnson', 'sarah.johnson@redcross.org', '(202) 303-5001', 'Regional Relationship Manager for National Capital area'),
('00000000-0000-0000-0000-000000000001', 'Michael Rodriguez', 'michael.rodriguez@redcross.org', '(202) 303-5002', 'Healthcare Partnership Manager'),
('00000000-0000-0000-0000-000000000001', 'Dr. Amanda Chen', 'amanda.chen@redcross.org', '(202) 303-5003', 'Faith & Community Partnerships Director')
ON CONFLICT DO NOTHING;

-- Verify the fix worked
SELECT 
  'Relationship managers table created!' as status,
  COUNT(*) as relationship_managers_count
FROM relationship_managers;