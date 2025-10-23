-- Add primary_contact_id to organizations table
ALTER TABLE organizations 
ADD COLUMN primary_contact_id UUID REFERENCES people(id) ON DELETE SET NULL;

-- Add index for performance
CREATE INDEX organizations_primary_contact_idx ON organizations (primary_contact_id);

-- Note: The primary contact must be a person who belongs to the organization
-- This constraint is enforced in the application layer for flexibility