-- Fix missing relationship_managers column
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS relationship_managers JSONB DEFAULT '[]'::JSONB;

-- Create index for relationship_managers JSONB column
CREATE INDEX IF NOT EXISTS organizations_relationship_managers_idx ON organizations USING GIN (relationship_managers);

-- Add comment to document the column
COMMENT ON COLUMN organizations.relationship_managers IS 'JSON array of Red Cross relationship manager information';