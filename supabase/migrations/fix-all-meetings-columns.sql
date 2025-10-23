-- Comprehensive fix for meetings table to ensure all columns exist
-- Run this in Supabase SQL Editor

-- Add summary column if it doesn't exist
ALTER TABLE meetings 
ADD COLUMN IF NOT EXISTS summary TEXT;

-- Add other_organizations column (array of organization IDs)
ALTER TABLE meetings 
ADD COLUMN IF NOT EXISTS other_organizations UUID[] DEFAULT '{}';

-- Add rc_attendees column (array of staff member IDs) 
ALTER TABLE meetings
ADD COLUMN IF NOT EXISTS rc_attendees UUID[] DEFAULT '{}';

-- Add attendees column (array of person IDs)
ALTER TABLE meetings
ADD COLUMN IF NOT EXISTS attendees UUID[] DEFAULT '{}';

-- Add lead_organization_id column
ALTER TABLE meetings
ADD COLUMN IF NOT EXISTS lead_organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL;

-- Add primary_external_poc_id column
ALTER TABLE meetings
ADD COLUMN IF NOT EXISTS primary_external_poc_id UUID REFERENCES people(id) ON DELETE SET NULL;

-- Add county_id column
ALTER TABLE meetings
ADD COLUMN IF NOT EXISTS county_id UUID;

-- Add next_meeting_date column
ALTER TABLE meetings
ADD COLUMN IF NOT EXISTS next_meeting_date DATE;

-- Add agenda column
ALTER TABLE meetings
ADD COLUMN IF NOT EXISTS agenda TEXT;

-- Add comments for documentation
COMMENT ON COLUMN meetings.summary IS 'Brief summary of meeting content and outcomes';
COMMENT ON COLUMN meetings.other_organizations IS 'Array of organization IDs that attended the meeting';
COMMENT ON COLUMN meetings.rc_attendees IS 'Array of Red Cross staff member IDs who attended';
COMMENT ON COLUMN meetings.attendees IS 'Array of external person IDs who attended';
COMMENT ON COLUMN meetings.lead_organization_id IS 'Primary organization hosting/leading the meeting';
COMMENT ON COLUMN meetings.primary_external_poc_id IS 'Primary external point of contact for the meeting';
COMMENT ON COLUMN meetings.county_id IS 'County where the meeting took place';
COMMENT ON COLUMN meetings.next_meeting_date IS 'Date of the next scheduled meeting';
COMMENT ON COLUMN meetings.agenda IS 'Meeting agenda or topics to be discussed';