-- Create geographic hierarchy table for all US counties
-- This will replace hardcoded county arrays with proper database structure

CREATE TABLE IF NOT EXISTS geographic_hierarchy (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Geographic identifiers
  county_name TEXT NOT NULL,
  state_code TEXT NOT NULL,
  state_name TEXT NOT NULL,
  fips_code TEXT UNIQUE, -- Federal Information Processing Standards code
  
  -- Red Cross organizational structure
  region_name TEXT,
  chapter_name TEXT,
  
  -- Additional metadata
  country TEXT DEFAULT 'United States',
  population INTEGER,
  square_miles DECIMAL,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Indexes for performance
  CONSTRAINT unique_county_state UNIQUE (county_name, state_code)
);

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_geographic_state ON geographic_hierarchy(state_code);
CREATE INDEX IF NOT EXISTS idx_geographic_region ON geographic_hierarchy(region_name);
CREATE INDEX IF NOT EXISTS idx_geographic_chapter ON geographic_hierarchy(chapter_name);
CREATE INDEX IF NOT EXISTS idx_geographic_fips ON geographic_hierarchy(fips_code);

-- Add county reference to organizations table
ALTER TABLE organizations 
ADD COLUMN IF NOT EXISTS county_id UUID REFERENCES geographic_hierarchy(id);

-- Create index on the foreign key
CREATE INDEX IF NOT EXISTS idx_organizations_county ON organizations(county_id);

-- Insert Florida counties first (from your CSV data)
INSERT INTO geographic_hierarchy (county_name, state_code, state_name, chapter_name, region_name, fips_code) VALUES
  ('Alachua County', 'FL', 'Florida', 'North Central Florida', 'North and Central', '12001'),
  ('Baker County', 'FL', 'Florida', 'Northeast Florida', 'North and Central', '12003'),
  ('Bay County', 'FL', 'Florida', 'Northwest Florida', 'North and Central', '12005'),
  ('Bradford County', 'FL', 'Florida', 'North Central Florida', 'North and Central', '12007'),
  ('Brevard County', 'FL', 'Florida', 'Central Florida Coast', 'North and Central', '12009'),
  ('Broward County', 'FL', 'Florida', 'Broward', 'South', '12011'),
  ('Calhoun County', 'FL', 'Florida', 'Capital Area', 'North and Central', '12013'),
  ('Charlotte County', 'FL', 'Florida', 'Southwest Gulf Coast to Glades', 'South', '12015'),
  ('Citrus County', 'FL', 'Florida', 'Tampa Bay', 'North and Central', '12017'),
  ('Clay County', 'FL', 'Florida', 'Northeast Florida', 'North and Central', '12019'),
  ('Collier County', 'FL', 'Florida', 'Southwest Gulf Coast to Glades', 'South', '12021'),
  ('Columbia County', 'FL', 'Florida', 'North Central Florida', 'North and Central', '12023'),
  ('DeSoto County', 'FL', 'Florida', 'Mid Florida', 'South', '12027'),
  ('Dixie County', 'FL', 'Florida', 'North Central Florida', 'North and Central', '12029'),
  ('Duval County', 'FL', 'Florida', 'Northeast Florida', 'North and Central', '12031'),
  ('Escambia County', 'FL', 'Florida', 'Northwest Florida', 'North and Central', '12033'),
  ('Flagler County', 'FL', 'Florida', 'Northeast Florida', 'North and Central', '12035'),
  ('Franklin County', 'FL', 'Florida', 'Capital Area', 'North and Central', '12037'),
  ('Gadsden County', 'FL', 'Florida', 'Capital Area', 'North and Central', '12039'),
  ('Gilchrist County', 'FL', 'Florida', 'North Central Florida', 'North and Central', '12041'),
  ('Glades County', 'FL', 'Florida', 'Mid Florida', 'South', '12043'),
  ('Gulf County', 'FL', 'Florida', 'Capital Area', 'North and Central', '12045'),
  ('Hamilton County', 'FL', 'Florida', 'North Central Florida', 'North and Central', '12047'),
  ('Hardee County', 'FL', 'Florida', 'Mid Florida', 'South', '12049'),
  ('Hendry County', 'FL', 'Florida', 'Southwest Gulf Coast to Glades', 'South', '12051'),
  ('Hernando County', 'FL', 'Florida', 'Tampa Bay', 'North and Central', '12053'),
  ('Highlands County', 'FL', 'Florida', 'Mid Florida', 'South', '12055'),
  ('Hillsborough County', 'FL', 'Florida', 'Tampa Bay', 'North and Central', '12057'),
  ('Holmes County', 'FL', 'Florida', 'Northwest Florida', 'North and Central', '12059'),
  ('Indian River County', 'FL', 'Florida', 'Palm Beach to Treasure Coast', 'South', '12061'),
  ('Jackson County', 'FL', 'Florida', 'Capital Area', 'North and Central', '12063'),
  ('Jefferson County', 'FL', 'Florida', 'Capital Area', 'North and Central', '12065'),
  ('Lafayette County', 'FL', 'Florida', 'North Central Florida', 'North and Central', '12067'),
  ('Lake County', 'FL', 'Florida', 'Central Florida Coast', 'North and Central', '12069'),
  ('Lee County', 'FL', 'Florida', 'Southwest Gulf Coast to Glades', 'South', '12071'),
  ('Leon County', 'FL', 'Florida', 'Capital Area', 'North and Central', '12073'),
  ('Levy County', 'FL', 'Florida', 'North Central Florida', 'North and Central', '12075'),
  ('Liberty County', 'FL', 'Florida', 'Capital Area', 'North and Central', '12077'),
  ('Madison County', 'FL', 'Florida', 'North Central Florida', 'North and Central', '12079'),
  ('Manatee County', 'FL', 'Florida', 'Tampa Bay', 'North and Central', '12081'),
  ('Marion County', 'FL', 'Florida', 'Central Florida Coast', 'North and Central', '12083'),
  ('Martin County', 'FL', 'Florida', 'Palm Beach to Treasure Coast', 'South', '12085'),
  ('Miami-Dade County', 'FL', 'Florida', 'Greater Miami to the Keys', 'South', '12086'),
  ('Monroe County', 'FL', 'Florida', 'Greater Miami to the Keys', 'South', '12087'),
  ('Nassau County', 'FL', 'Florida', 'Northeast Florida', 'North and Central', '12089'),
  ('Okaloosa County', 'FL', 'Florida', 'Northwest Florida', 'North and Central', '12091'),
  ('Okeechobee County', 'FL', 'Florida', 'Mid Florida', 'South', '12093'),
  ('Orange County', 'FL', 'Florida', 'Central Florida Coast', 'North and Central', '12095'),
  ('Osceola County', 'FL', 'Florida', 'Central Florida Coast', 'North and Central', '12097'),
  ('Palm Beach County', 'FL', 'Florida', 'Palm Beach to Treasure Coast', 'South', '12099'),
  ('Pasco County', 'FL', 'Florida', 'Tampa Bay', 'North and Central', '12101'),
  ('Pinellas County', 'FL', 'Florida', 'Tampa Bay', 'North and Central', '12103'),
  ('Polk County', 'FL', 'Florida', 'Mid Florida', 'South', '12105'),
  ('Putnam County', 'FL', 'Florida', 'Northeast Florida', 'North and Central', '12107'),
  ('Santa Rosa County', 'FL', 'Florida', 'Northwest Florida', 'North and Central', '12113'),
  ('Sarasota County', 'FL', 'Florida', 'Southwest Gulf Coast to Glades', 'South', '12115'),
  ('Seminole County', 'FL', 'Florida', 'Central Florida Coast', 'North and Central', '12117'),
  ('St. Johns County', 'FL', 'Florida', 'Northeast Florida', 'North and Central', '12109'),
  ('St. Lucie County', 'FL', 'Florida', 'Palm Beach to Treasure Coast', 'South', '12111'),
  ('Sumter County', 'FL', 'Florida', 'Central Florida Coast', 'North and Central', '12119'),
  ('Suwannee County', 'FL', 'Florida', 'North Central Florida', 'North and Central', '12121'),
  ('Taylor County', 'FL', 'Florida', 'North Central Florida', 'North and Central', '12123'),
  ('Union County', 'FL', 'Florida', 'North Central Florida', 'North and Central', '12125'),
  ('Volusia County', 'FL', 'Florida', 'Central Florida Coast', 'North and Central', '12127'),
  ('Wakulla County', 'FL', 'Florida', 'Capital Area', 'North and Central', '12129'),
  ('Walton County', 'FL', 'Florida', 'Northwest Florida', 'North and Central', '12131'),
  ('Washington County', 'FL', 'Florida', 'Northwest Florida', 'North and Central', '12133')
ON CONFLICT (county_name, state_code) DO NOTHING;

-- Add sample data for other major states (you can expand this with your regions/chapters)
-- Note: These will need Red Cross region/chapter assignments from you

-- California counties (58 total)
INSERT INTO geographic_hierarchy (county_name, state_code, state_name, fips_code) VALUES
  ('Alameda County', 'CA', 'California', '06001'),
  ('Alpine County', 'CA', 'California', '06003'),
  ('Amador County', 'CA', 'California', '06005'),
  ('Butte County', 'CA', 'California', '06007'),
  ('Calaveras County', 'CA', 'California', '06009'),
  ('Colusa County', 'CA', 'California', '06011'),
  ('Contra Costa County', 'CA', 'California', '06013'),
  ('Del Norte County', 'CA', 'California', '06015'),
  ('El Dorado County', 'CA', 'California', '06017'),
  ('Fresno County', 'CA', 'California', '06019'),
  ('Glenn County', 'CA', 'California', '06021'),
  ('Humboldt County', 'CA', 'California', '06023'),
  ('Imperial County', 'CA', 'California', '06025'),
  ('Inyo County', 'CA', 'California', '06027'),
  ('Kern County', 'CA', 'California', '06029'),
  ('Kings County', 'CA', 'California', '06031'),
  ('Lake County', 'CA', 'California', '06033'),
  ('Lassen County', 'CA', 'California', '06035'),
  ('Los Angeles County', 'CA', 'California', '06037'),
  ('Madera County', 'CA', 'California', '06039'),
  ('Marin County', 'CA', 'California', '06041'),
  ('Mariposa County', 'CA', 'California', '06043'),
  ('Mendocino County', 'CA', 'California', '06045'),
  ('Merced County', 'CA', 'California', '06047'),
  ('Modoc County', 'CA', 'California', '06049'),
  ('Mono County', 'CA', 'California', '06051'),
  ('Monterey County', 'CA', 'California', '06053'),
  ('Napa County', 'CA', 'California', '06055'),
  ('Nevada County', 'CA', 'California', '06057'),
  ('Orange County', 'CA', 'California', '06059'),
  ('Placer County', 'CA', 'California', '06061'),
  ('Plumas County', 'CA', 'California', '06063'),
  ('Riverside County', 'CA', 'California', '06065'),
  ('Sacramento County', 'CA', 'California', '06067'),
  ('San Benito County', 'CA', 'California', '06069'),
  ('San Bernardino County', 'CA', 'California', '06071'),
  ('San Diego County', 'CA', 'California', '06073'),
  ('San Francisco County', 'CA', 'California', '06075'),
  ('San Joaquin County', 'CA', 'California', '06077'),
  ('San Luis Obispo County', 'CA', 'California', '06079'),
  ('San Mateo County', 'CA', 'California', '06081'),
  ('Santa Barbara County', 'CA', 'California', '06083'),
  ('Santa Clara County', 'CA', 'California', '06085'),
  ('Santa Cruz County', 'CA', 'California', '06087'),
  ('Shasta County', 'CA', 'California', '06089'),
  ('Sierra County', 'CA', 'California', '06091'),
  ('Siskiyou County', 'CA', 'California', '06093'),
  ('Solano County', 'CA', 'California', '06095'),
  ('Sonoma County', 'CA', 'California', '06097'),
  ('Stanislaus County', 'CA', 'California', '06099'),
  ('Sutter County', 'CA', 'California', '06101'),
  ('Tehama County', 'CA', 'California', '06103'),
  ('Trinity County', 'CA', 'California', '06105'),
  ('Tulare County', 'CA', 'California', '06107'),
  ('Tuolumne County', 'CA', 'California', '06109'),
  ('Ventura County', 'CA', 'California', '06111'),
  ('Yolo County', 'CA', 'California', '06113'),
  ('Yuba County', 'CA', 'California', '06115')
ON CONFLICT (county_name, state_code) DO NOTHING;

-- Texas counties (254 total - showing first 25 as example)
INSERT INTO geographic_hierarchy (county_name, state_code, state_name, fips_code) VALUES
  ('Anderson County', 'TX', 'Texas', '48001'),
  ('Andrews County', 'TX', 'Texas', '48003'),
  ('Angelina County', 'TX', 'Texas', '48005'),
  ('Aransas County', 'TX', 'Texas', '48007'),
  ('Archer County', 'TX', 'Texas', '48009'),
  ('Armstrong County', 'TX', 'Texas', '48011'),
  ('Atascosa County', 'TX', 'Texas', '48013'),
  ('Austin County', 'TX', 'Texas', '48015'),
  ('Bailey County', 'TX', 'Texas', '48017'),
  ('Bandera County', 'TX', 'Texas', '48019'),
  ('Bastrop County', 'TX', 'Texas', '48021'),
  ('Baylor County', 'TX', 'Texas', '48023'),
  ('Bee County', 'TX', 'Texas', '48025'),
  ('Bell County', 'TX', 'Texas', '48027'),
  ('Bexar County', 'TX', 'Texas', '48029'),
  ('Blanco County', 'TX', 'Texas', '48031'),
  ('Borden County', 'TX', 'Texas', '48033'),
  ('Bosque County', 'TX', 'Texas', '48035'),
  ('Bowie County', 'TX', 'Texas', '48037'),
  ('Brazoria County', 'TX', 'Texas', '48039'),
  ('Brazos County', 'TX', 'Texas', '48041'),
  ('Brewster County', 'TX', 'Texas', '48043'),
  ('Briscoe County', 'TX', 'Texas', '48045'),
  ('Brooks County', 'TX', 'Texas', '48047'),
  ('Brown County', 'TX', 'Texas', '48049')
ON CONFLICT (county_name, state_code) DO NOTHING;

-- Create a function to easily add more counties
CREATE OR REPLACE FUNCTION add_county(
  p_county_name TEXT,
  p_state_code TEXT,
  p_state_name TEXT,
  p_fips_code TEXT DEFAULT NULL,
  p_region_name TEXT DEFAULT NULL,
  p_chapter_name TEXT DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
  county_id UUID;
BEGIN
  INSERT INTO geographic_hierarchy (
    county_name, state_code, state_name, fips_code, region_name, chapter_name
  ) VALUES (
    p_county_name, p_state_code, p_state_name, p_fips_code, p_region_name, p_chapter_name
  ) 
  ON CONFLICT (county_name, state_code) 
  DO UPDATE SET 
    region_name = COALESCE(EXCLUDED.region_name, geographic_hierarchy.region_name),
    chapter_name = COALESCE(EXCLUDED.chapter_name, geographic_hierarchy.chapter_name),
    updated_at = NOW()
  RETURNING id INTO county_id;
  
  RETURN county_id;
END;
$$ LANGUAGE plpgsql;

-- Add comments for documentation
COMMENT ON TABLE geographic_hierarchy IS 'Complete US county hierarchy with Red Cross organizational structure';
COMMENT ON COLUMN geographic_hierarchy.fips_code IS 'Federal Information Processing Standards county code';
COMMENT ON COLUMN geographic_hierarchy.region_name IS 'Red Cross regional division';
COMMENT ON COLUMN geographic_hierarchy.chapter_name IS 'Red Cross chapter assignment';