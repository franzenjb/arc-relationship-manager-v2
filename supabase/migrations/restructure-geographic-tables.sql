-- RESTRUCTURE GEOGRAPHIC TABLES
-- Counties are the main geographic unit
-- They belong to chapters, which belong to regions, which belong to divisions

-- First, drop the existing foreign key constraints if they exist
ALTER TABLE counties DROP CONSTRAINT IF EXISTS counties_chapter_id_fkey;

-- Add the missing fields to counties table
ALTER TABLE counties 
  ADD COLUMN IF NOT EXISTS division VARCHAR(255),
  ADD COLUMN IF NOT EXISTS division_code VARCHAR(50),
  ADD COLUMN IF NOT EXISTS region VARCHAR(255),
  ADD COLUMN IF NOT EXISTS region_code VARCHAR(50),
  ADD COLUMN IF NOT EXISTS chapter VARCHAR(255),
  ADD COLUMN IF NOT EXISTS chapter_code VARCHAR(50);

-- Update some sample data to show the hierarchy
-- Example: Montgomery County, MD belongs to:
-- - DC Metro Chapter
-- - National Capital & Greater Chesapeake Region  
-- - Eastern Division

UPDATE counties 
SET 
  division = 'Eastern Division',
  division_code = 'EAST',
  region = 'National Capital & Greater Chesapeake',
  region_code = 'NCGC',
  chapter = 'DC Metro Chapter',
  chapter_code = 'DCM'
WHERE name = 'Montgomery County' AND state_code = 'MD';

-- We can keep the other tables for lookup/reference but counties is the main one
-- Or we can drop them if not needed:
-- DROP TABLE IF EXISTS divisions CASCADE;
-- DROP TABLE IF EXISTS regions CASCADE;  
-- DROP TABLE IF EXISTS chapters CASCADE;

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_counties_chapter ON counties(chapter);
CREATE INDEX IF NOT EXISTS idx_counties_region ON counties(region);
CREATE INDEX IF NOT EXISTS idx_counties_division ON counties(division);
CREATE INDEX IF NOT EXISTS idx_counties_state ON counties(state_code);

-- Add comments to document the structure
COMMENT ON COLUMN counties.division IS 'Division name (e.g., Eastern Division)';
COMMENT ON COLUMN counties.division_code IS 'Division code (e.g., EAST)';
COMMENT ON COLUMN counties.region IS 'Region name (e.g., National Capital & Greater Chesapeake)';
COMMENT ON COLUMN counties.region_code IS 'Region code (e.g., NCGC)';
COMMENT ON COLUMN counties.chapter IS 'Chapter name (e.g., DC Metro Chapter)';
COMMENT ON COLUMN counties.chapter_code IS 'Chapter code (e.g., DCM)';

-- View to get unique chapters
CREATE OR REPLACE VIEW unique_chapters AS
SELECT DISTINCT 
  chapter,
  chapter_code,
  region,
  region_code,
  division,
  division_code
FROM counties
WHERE chapter IS NOT NULL
ORDER BY division, region, chapter;

-- View to get unique regions
CREATE OR REPLACE VIEW unique_regions AS
SELECT DISTINCT 
  region,
  region_code,
  division,
  division_code
FROM counties
WHERE region IS NOT NULL
ORDER BY division, region;

-- View to get unique divisions
CREATE OR REPLACE VIEW unique_divisions AS
SELECT DISTINCT 
  division,
  division_code
FROM counties
WHERE division IS NOT NULL
ORDER BY division;