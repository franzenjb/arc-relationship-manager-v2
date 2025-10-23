-- FIX FOR ATTENDEES: Create proper many-to-many relationship
-- This creates a junction table for meeting attendees

-- 1. Create junction table for meeting attendees
CREATE TABLE IF NOT EXISTS meeting_attendees (
    meeting_id UUID NOT NULL REFERENCES meetings(id) ON DELETE CASCADE,
    person_id UUID NOT NULL REFERENCES people(id) ON DELETE CASCADE,
    attendance_status VARCHAR(50) DEFAULT 'attended', -- attended, no-show, tentative
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    created_by UUID,
    PRIMARY KEY (meeting_id, person_id)
);

-- 2. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_meeting_attendees_meeting ON meeting_attendees(meeting_id);
CREATE INDEX IF NOT EXISTS idx_meeting_attendees_person ON meeting_attendees(person_id);

-- 3. Create view for easy querying with attendee names
CREATE OR REPLACE VIEW meeting_attendees_view AS
SELECT 
    ma.meeting_id,
    ma.person_id,
    ma.attendance_status,
    ma.notes,
    p.first_name,
    p.last_name,
    p.email,
    p.title,
    o.name as organization_name
FROM meeting_attendees ma
JOIN people p ON ma.person_id = p.id
LEFT JOIN organizations o ON p.org_id = o.id;

-- 4. Grant permissions
GRANT ALL ON meeting_attendees TO authenticated;
GRANT ALL ON meeting_attendees_view TO authenticated;

-- 5. Enable RLS
ALTER TABLE meeting_attendees ENABLE ROW LEVEL SECURITY;

-- 6. Create RLS policies
CREATE POLICY "Users can view meeting attendees" ON meeting_attendees
    FOR SELECT USING (true);

CREATE POLICY "Users can manage meeting attendees" ON meeting_attendees
    FOR ALL USING (true);

COMMENT ON TABLE meeting_attendees IS 'Junction table linking meetings to their attendees (people)';
COMMENT ON COLUMN meeting_attendees.attendance_status IS 'Status of attendance: attended, no-show, tentative';