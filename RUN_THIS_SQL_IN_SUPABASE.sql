-- IMPORTANT: Run this SQL directly in your Supabase SQL Editor
-- Go to: https://supabase.com/dashboard/project/yqucprgxgdnowjnzrtoz/sql/new
-- Paste this entire script and click "Run"

-- This will add ALL missing columns to the meetings table

-- Add other_organizations column (FIXES YOUR CURRENT ERROR)
ALTER TABLE meetings 
ADD COLUMN IF NOT EXISTS other_organizations UUID[] DEFAULT '{}';

-- Add summary column
ALTER TABLE meetings 
ADD COLUMN IF NOT EXISTS summary TEXT;

-- Add rc_attendees column
ALTER TABLE meetings
ADD COLUMN IF NOT EXISTS rc_attendees UUID[] DEFAULT '{}';

-- Add attendees column
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

-- Verify all columns exist
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'meetings'
ORDER BY ordinal_position;