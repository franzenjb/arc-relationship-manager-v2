-- Create Red Cross Geography table with full hierarchy and demographics
-- Source: ArcGIS Master_RC_Geo_County_2025 (3,162 counties)

CREATE TABLE IF NOT EXISTS red_cross_geography (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- Geographic identifiers
  geo_id TEXT UNIQUE NOT NULL,
  fips TEXT,
  county TEXT NOT NULL,
  county_long TEXT,
  county_st TEXT,
  county_st_long TEXT,
  state TEXT NOT NULL,
  
  -- Red Cross hierarchy
  division TEXT NOT NULL,
  division_code TEXT,
  region TEXT NOT NULL,
  region_code TEXT,
  chapter TEXT NOT NULL,
  chapter_code TEXT,
  
  -- Chapter contact info
  address TEXT,
  address_2 TEXT,
  city TEXT,
  zip TEXT,
  phone TEXT,
  time_zone TEXT,
  fema_region TEXT,
  
  -- Geographic metrics
  acres NUMERIC,
  sq_mi NUMERIC,
  
  -- 2023 Population demographics
  pop_2023 INTEGER,
  pop_2028 INTEGER,
  male_pop_2023 INTEGER,
  female_pop_2023 INTEGER,
  hh_pop_2023 INTEGER,
  fam_pop_2023 INTEGER,
  pop_den_2023 NUMERIC,
  
  -- Household statistics
  total_hh_2023 INTEGER,
  avg_hh_size_2023 NUMERIC,
  avg_fam_size_2023 NUMERIC,
  total_hu_2023 INTEGER,
  owner_2023 INTEGER,
  renter_2023 INTEGER,
  vacant_2023 INTEGER,
  
  -- Housing values
  med_home_val_2023 NUMERIC,
  avg_home_val_2023 NUMERIC,
  
  -- Age demographics
  median_age_2023 NUMERIC,
  youth_0_14_pop_2023 INTEGER,
  yng_adult_15_24_pop_2023 INTEGER,
  adult_25_64_pop_2023 INTEGER,
  seniors_65_up_pop_2023 INTEGER,
  
  -- Race/ethnicity
  pop_white_2023 INTEGER,
  pop_black_2023 INTEGER,
  pop_am_indian_2023 INTEGER,
  pop_asian_2023 INTEGER,
  pop_pacific_2023 INTEGER,
  pop_other_2023 INTEGER,
  pop_2_plus_races_2023 INTEGER,
  hisp_pop_2023 INTEGER,
  diversity_index_2023 NUMERIC,
  
  -- Economic indicators
  med_hh_inc_2023 NUMERIC,
  avg_hh_inc_2023 NUMERIC,
  per_cap_inc_2023 NUMERIC,
  emp_pop_2023 INTEGER,
  unemp_pop_2023 INTEGER,
  unemp_rate_2023 NUMERIC,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for common queries
CREATE INDEX idx_geography_state ON red_cross_geography(state);
CREATE INDEX idx_geography_county ON red_cross_geography(county);
CREATE INDEX idx_geography_division ON red_cross_geography(division);
CREATE INDEX idx_geography_region ON red_cross_geography(region);
CREATE INDEX idx_geography_chapter ON red_cross_geography(chapter);
CREATE INDEX idx_geography_fips ON red_cross_geography(fips);
CREATE INDEX idx_geography_geo_id ON red_cross_geography(geo_id);

-- Add RLS policies
ALTER TABLE red_cross_geography ENABLE ROW LEVEL SECURITY;

-- Allow read access to all authenticated users
CREATE POLICY "Allow read access to geography" ON red_cross_geography
  FOR SELECT USING (true);

-- Only allow system admins to modify
CREATE POLICY "Only admins can modify geography" ON red_cross_geography
  FOR ALL USING (false);

COMMENT ON TABLE red_cross_geography IS 'Complete Red Cross geographic hierarchy with 3,162 US counties and demographics';
COMMENT ON COLUMN red_cross_geography.geo_id IS 'Unique geographic identifier from ArcGIS';
COMMENT ON COLUMN red_cross_geography.fips IS 'Federal Information Processing Standards code';
COMMENT ON COLUMN red_cross_geography.division IS 'Red Cross Division (top level - 6 total)';
COMMENT ON COLUMN red_cross_geography.region IS 'Red Cross Region (48 total)';
COMMENT ON COLUMN red_cross_geography.chapter IS 'Red Cross Chapter (225 total)';
COMMENT ON COLUMN red_cross_geography.diversity_index_2023 IS 'Esri Diversity Index 2023';