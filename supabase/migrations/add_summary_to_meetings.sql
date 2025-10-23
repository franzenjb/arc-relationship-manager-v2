-- Add summary column to meetings table
ALTER TABLE meetings 
ADD COLUMN IF NOT EXISTS summary TEXT;

-- Add comment for clarity
COMMENT ON COLUMN meetings.summary IS 'Brief summary of the meeting content and outcomes';