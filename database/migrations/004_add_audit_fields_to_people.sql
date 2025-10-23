-- Add missing audit fields to people table
ALTER TABLE people 
ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS updated_by UUID REFERENCES auth.users(id);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS people_created_by_idx ON people (created_by);
CREATE INDEX IF NOT EXISTS people_updated_by_idx ON people (updated_by);

-- Add trigger for updated_at if it doesn't exist
CREATE TRIGGER IF NOT EXISTS update_people_updated_at 
  BEFORE UPDATE ON people 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();