-- Update tables to match Red Cross actual needs based on their current system

-- 1. Add missing fields to organizations table
ALTER TABLE organizations 
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS partner_type VARCHAR(100), -- Faith Based, Government, Business, etc.
ADD COLUMN IF NOT EXISTS relationship_manager_id UUID REFERENCES staff_members(id),
ADD COLUMN IF NOT EXISTS alternate_relationship_manager_id UUID REFERENCES staff_members(id),
ADD COLUMN IF NOT EXISTS last_contact_date DATE,
ADD COLUMN IF NOT EXISTS goals TEXT;

-- 2. Create mission areas table (for many-to-many relationships)
CREATE TABLE IF NOT EXISTS mission_areas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL UNIQUE,
    category VARCHAR(50), -- Recovery, Response, Preparedness, etc.
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create organization_mission_areas junction table
CREATE TABLE IF NOT EXISTS organization_mission_areas (
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    mission_area_id UUID REFERENCES mission_areas(id) ON DELETE CASCADE,
    PRIMARY KEY (organization_id, mission_area_id)
);

-- 4. Create LOS (Line of Service) relationships table
CREATE TABLE IF NOT EXISTS lines_of_service (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Create organization_los junction table
CREATE TABLE IF NOT EXISTS organization_los (
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    los_id UUID REFERENCES lines_of_service(id) ON DELETE CASCADE,
    PRIMARY KEY (organization_id, los_id)
);

-- 6. Update partner types
CREATE TABLE IF NOT EXISTS partner_types (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on new tables
ALTER TABLE mission_areas ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_mission_areas ENABLE ROW LEVEL SECURITY;
ALTER TABLE lines_of_service ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_los ENABLE ROW LEVEL SECURITY;
ALTER TABLE partner_types ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "View mission areas" ON mission_areas FOR SELECT USING (true);
CREATE POLICY "Manage mission areas" ON mission_areas FOR ALL USING (true);

CREATE POLICY "View org mission areas" ON organization_mission_areas FOR SELECT USING (true);
CREATE POLICY "Manage org mission areas" ON organization_mission_areas FOR ALL USING (true);

CREATE POLICY "View lines of service" ON lines_of_service FOR SELECT USING (true);
CREATE POLICY "Manage lines of service" ON lines_of_service FOR ALL USING (true);

CREATE POLICY "View org los" ON organization_los FOR SELECT USING (true);
CREATE POLICY "Manage org los" ON organization_los FOR ALL USING (true);

CREATE POLICY "View partner types" ON partner_types FOR SELECT USING (true);
CREATE POLICY "Manage partner types" ON partner_types FOR ALL USING (true);

-- Insert standard Red Cross mission areas
INSERT INTO mission_areas (name, category) VALUES
    ('Mass Care', 'Response'),
    ('Sheltering', 'Response'),
    ('Feeding', 'Response'),
    ('Distribution of Emergency Supplies', 'Response'),
    ('Health Services', 'Response'),
    ('Mental Health Services', 'Response'),
    ('Spiritual Care', 'Response'),
    ('Reunification', 'Response'),
    ('Casework', 'Recovery'),
    ('Financial Assistance', 'Recovery'),
    ('Recovery Planning', 'Recovery'),
    ('Community Partnerships', 'Recovery'),
    ('Disaster Education', 'Preparedness'),
    ('Home Fire Campaign', 'Preparedness'),
    ('Youth Preparedness', 'Preparedness'),
    ('Community Resilience', 'Preparedness')
ON CONFLICT (name) DO NOTHING;

-- Insert standard Lines of Service
INSERT INTO lines_of_service (name, description) VALUES
    ('Disaster Services', 'Disaster relief and response operations'),
    ('Service to Armed Forces', 'Support for military families and veterans'),
    ('Blood Services', 'Blood collection and distribution'),
    ('Health and Safety Training', 'CPR, First Aid, and other safety training'),
    ('International Services', 'International humanitarian programs'),
    ('Youth Services', 'Youth programs and education'),
    ('Volunteer Services', 'Volunteer recruitment and management')
ON CONFLICT (name) DO NOTHING;

-- Insert standard partner types
INSERT INTO partner_types (name) VALUES
    ('Faith Based'),
    ('Government - Federal'),
    ('Government - State'),
    ('Government - Local'),
    ('Business - Corporation'),
    ('Business - Small/Local'),
    ('Nonprofit - National'),
    ('Nonprofit - Local'),
    ('Healthcare'),
    ('Educational Institution'),
    ('Community Organization'),
    ('Foundation'),
    ('Media'),
    ('Individual Donor')
ON CONFLICT (name) DO NOTHING;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_org_partner_type ON organizations(partner_type);
CREATE INDEX IF NOT EXISTS idx_org_last_contact ON organizations(last_contact_date);
CREATE INDEX IF NOT EXISTS idx_org_relationship_mgr ON organizations(relationship_manager_id);
CREATE INDEX IF NOT EXISTS idx_org_alt_relationship_mgr ON organizations(alternate_relationship_manager_id);

-- Grant permissions
GRANT ALL ON mission_areas TO anon, authenticated;
GRANT ALL ON organization_mission_areas TO anon, authenticated;
GRANT ALL ON lines_of_service TO anon, authenticated;
GRANT ALL ON organization_los TO anon, authenticated;
GRANT ALL ON partner_types TO anon, authenticated;

-- Create a comprehensive view for organizations with all relationships
CREATE OR REPLACE VIEW organization_full_view AS
SELECT 
    o.*,
    c.county_name,
    c.state,
    ch.name as chapter_name,
    r.name as region_name,
    d.name as division_name,
    sm1.first_name || ' ' || sm1.last_name as relationship_manager_name,
    sm2.first_name || ' ' || sm2.last_name as alternate_manager_name,
    array_agg(DISTINCT ma.name) FILTER (WHERE ma.name IS NOT NULL) as mission_areas,
    array_agg(DISTINCT los.name) FILTER (WHERE los.name IS NOT NULL) as lines_of_service
FROM organizations o
LEFT JOIN counties c ON o.county_id = c.id
LEFT JOIN chapters ch ON c.chapter_id = ch.id
LEFT JOIN regions r ON ch.region_id = r.id
LEFT JOIN divisions d ON r.division_id = d.id
LEFT JOIN staff_members sm1 ON o.relationship_manager_id = sm1.id
LEFT JOIN staff_members sm2 ON o.alternate_relationship_manager_id = sm2.id
LEFT JOIN organization_mission_areas oma ON o.id = oma.organization_id
LEFT JOIN mission_areas ma ON oma.mission_area_id = ma.id
LEFT JOIN organization_los olos ON o.id = olos.organization_id
LEFT JOIN lines_of_service los ON olos.los_id = los.id
GROUP BY o.id, c.county_name, c.state, ch.name, r.name, d.name, 
         sm1.first_name, sm1.last_name, sm2.first_name, sm2.last_name;

GRANT SELECT ON organization_full_view TO anon, authenticated;

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'Tables updated to match Red Cross requirements';
    RAISE NOTICE 'Added: Mission Areas, Lines of Service, Partner Types';
    RAISE NOTICE 'Added: Relationship Managers, Last Contact Date, Goals';
END
$$;