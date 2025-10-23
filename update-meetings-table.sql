-- Update meetings table to match Red Cross actual requirements

-- Add missing fields to meetings table
ALTER TABLE meetings 
ADD COLUMN IF NOT EXISTS meeting_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS lead_organization_id UUID REFERENCES organizations(id),
ADD COLUMN IF NOT EXISTS primary_external_poc_id UUID REFERENCES people(id),
ADD COLUMN IF NOT EXISTS agenda TEXT,
ADD COLUMN IF NOT EXISTS next_meeting_date DATE,
ADD COLUMN IF NOT EXISTS county_id UUID REFERENCES counties(id),
DROP COLUMN IF EXISTS follow_up_date; -- Replace with next_meeting_date

-- Rename summary to notes if needed (more accurate)
ALTER TABLE meetings 
RENAME COLUMN summary TO notes;

-- Create table for Red Cross attendees (staff members who attended)
CREATE TABLE IF NOT EXISTS meeting_rc_attendees (
    meeting_id UUID REFERENCES meetings(id) ON DELETE CASCADE,
    staff_member_id UUID REFERENCES staff_members(id) ON DELETE CASCADE,
    role VARCHAR(100), -- Their role in the meeting
    notes TEXT,
    PRIMARY KEY (meeting_id, staff_member_id)
);

-- Create table for other organizations present at meetings
CREATE TABLE IF NOT EXISTS meeting_organizations (
    meeting_id UUID REFERENCES meetings(id) ON DELETE CASCADE,
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    role VARCHAR(100), -- Host, Participant, Observer, etc.
    PRIMARY KEY (meeting_id, organization_id)
);

-- Enable RLS
ALTER TABLE meeting_rc_attendees ENABLE ROW LEVEL SECURITY;
ALTER TABLE meeting_organizations ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "View RC attendees" ON meeting_rc_attendees FOR SELECT USING (true);
CREATE POLICY "Manage RC attendees" ON meeting_rc_attendees FOR ALL USING (true);

CREATE POLICY "View meeting organizations" ON meeting_organizations FOR SELECT USING (true);
CREATE POLICY "Manage meeting organizations" ON meeting_organizations FOR ALL USING (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_meeting_lead_org ON meetings(lead_organization_id);
CREATE INDEX IF NOT EXISTS idx_meeting_external_poc ON meetings(primary_external_poc_id);
CREATE INDEX IF NOT EXISTS idx_meeting_county ON meetings(county_id);
CREATE INDEX IF NOT EXISTS idx_meeting_next_date ON meetings(next_meeting_date);

-- Grant permissions
GRANT ALL ON meeting_rc_attendees TO anon, authenticated;
GRANT ALL ON meeting_organizations TO anon, authenticated;

-- Create comprehensive meeting view
CREATE OR REPLACE VIEW meeting_full_view AS
SELECT 
    m.*,
    o.name as organization_name,
    lo.name as lead_organization_name,
    p.first_name || ' ' || p.last_name as primary_external_poc_name,
    c.county_name,
    c.state,
    ch.name as chapter_name,
    r.name as region_name,
    array_agg(DISTINCT sm.first_name || ' ' || sm.last_name) FILTER (WHERE sm.id IS NOT NULL) as rc_attendees,
    array_agg(DISTINCT mo_org.name) FILTER (WHERE mo_org.id IS NOT NULL) as other_organizations
FROM meetings m
LEFT JOIN organizations o ON m.org_id = o.id
LEFT JOIN organizations lo ON m.lead_organization_id = lo.id
LEFT JOIN people p ON m.primary_external_poc_id = p.id
LEFT JOIN counties c ON m.county_id = c.id
LEFT JOIN chapters ch ON c.chapter_id = ch.id
LEFT JOIN regions r ON ch.region_id = r.id
LEFT JOIN meeting_rc_attendees mra ON m.id = mra.meeting_id
LEFT JOIN staff_members sm ON mra.staff_member_id = sm.id
LEFT JOIN meeting_organizations mo ON m.id = mo.meeting_id
LEFT JOIN organizations mo_org ON mo.organization_id = mo_org.id
GROUP BY m.id, o.name, lo.name, p.first_name, p.last_name, 
         c.county_name, c.state, ch.name, r.name;

GRANT SELECT ON meeting_full_view TO anon, authenticated;

-- Update some sample data to test
UPDATE meetings 
SET meeting_name = 'Quarterly Partnership Review',
    description = 'Regular quarterly meeting to review partnership activities and plan upcoming initiatives',
    agenda = '1. Review Q4 activities\n2. Plan Q1 initiatives\n3. Discuss volunteer recruitment\n4. Emergency preparedness updates'
WHERE id = (SELECT id FROM meetings LIMIT 1);

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'Meetings table updated to match Red Cross requirements';
    RAISE NOTICE 'Added: meeting_name, description, lead_organization, external POC, agenda';
    RAISE NOTICE 'Added: RC attendees tracking, other organizations tracking';
END
$$;