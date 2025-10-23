-- Create Red Cross Staff Members table
-- This separates internal staff from external contacts

CREATE TABLE IF NOT EXISTS staff_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(50),
    title VARCHAR(100),
    department VARCHAR(100),
    region VARCHAR(100),
    role VARCHAR(50) DEFAULT 'staff', -- staff, manager, admin, executive
    is_active BOOLEAN DEFAULT true,
    start_date DATE,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID,
    updated_by UUID
);

-- Enable RLS
ALTER TABLE staff_members ENABLE ROW LEVEL SECURITY;

-- Create policies for staff table
CREATE POLICY "Anyone can view staff" ON staff_members
    FOR SELECT USING (true);
    
CREATE POLICY "Anyone can create staff" ON staff_members
    FOR INSERT WITH CHECK (true);
    
CREATE POLICY "Anyone can update staff" ON staff_members
    FOR UPDATE USING (true);

-- Add relationship manager column to organizations (links to staff)
ALTER TABLE organizations 
ADD COLUMN IF NOT EXISTS relationship_manager_id UUID REFERENCES staff_members(id);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_staff_email ON staff_members(email);
CREATE INDEX IF NOT EXISTS idx_staff_active ON staff_members(is_active);
CREATE INDEX IF NOT EXISTS idx_org_relationship_manager ON organizations(relationship_manager_id);

-- Insert yourself as the first staff member
INSERT INTO staff_members (
    first_name, 
    last_name, 
    email, 
    phone,
    title,
    department,
    role,
    is_active
) VALUES (
    'Jeff',
    'Franzen',
    'Jeff.Franzen2@redcross.org',
    '703-957-5711',
    'Senior Application Developer',
    'Information Technology',
    'admin',
    true
) ON CONFLICT (email) DO NOTHING;

-- Grant permissions
GRANT ALL ON staff_members TO anon, authenticated;

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'Staff members table created successfully';
END
$$;