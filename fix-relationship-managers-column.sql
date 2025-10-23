-- Add relationship_managers column to organizations table
-- This column will store an array of relationship manager IDs

ALTER TABLE organizations 
ADD COLUMN IF NOT EXISTS relationship_managers text[] DEFAULT '{}';

-- Update any existing organizations to have empty array
UPDATE organizations 
SET relationship_managers = '{}' 
WHERE relationship_managers IS NULL;

-- Add comment for documentation
COMMENT ON COLUMN organizations.relationship_managers IS 'Array of person IDs who are relationship managers for this organization';