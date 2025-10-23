-- Create Geographic Hierarchy for American Red Cross
-- Division > Region > Chapter > County structure

-- 1. Create Divisions table (highest level)
CREATE TABLE IF NOT EXISTS divisions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL UNIQUE,
    code VARCHAR(10) UNIQUE,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create Regions table
CREATE TABLE IF NOT EXISTS regions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    division_id UUID REFERENCES divisions(id),
    name VARCHAR(100) NOT NULL,
    code VARCHAR(10) UNIQUE,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create Chapters table
CREATE TABLE IF NOT EXISTS chapters (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    region_id UUID REFERENCES regions(id),
    name VARCHAR(100) NOT NULL,
    code VARCHAR(20),
    address VARCHAR(255),
    city VARCHAR(100),
    state VARCHAR(2),
    zip VARCHAR(20),
    phone VARCHAR(50),
    website VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Create Counties table (most granular level)
CREATE TABLE IF NOT EXISTS counties (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    chapter_id UUID REFERENCES chapters(id),
    county_name VARCHAR(100) NOT NULL,
    state VARCHAR(2) NOT NULL,
    fips_code VARCHAR(5), -- Federal Information Processing Standards code
    population INTEGER,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(county_name, state)
);

-- Enable RLS on all geographic tables
ALTER TABLE divisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE regions ENABLE ROW LEVEL SECURITY;
ALTER TABLE chapters ENABLE ROW LEVEL SECURITY;
ALTER TABLE counties ENABLE ROW LEVEL SECURITY;

-- Create read policies for all geographic tables
CREATE POLICY "Anyone can view divisions" ON divisions FOR SELECT USING (true);
CREATE POLICY "Anyone can view regions" ON regions FOR SELECT USING (true);
CREATE POLICY "Anyone can view chapters" ON chapters FOR SELECT USING (true);
CREATE POLICY "Anyone can view counties" ON counties FOR SELECT USING (true);

-- Create insert/update policies (for admin use)
CREATE POLICY "Anyone can manage divisions" ON divisions FOR ALL USING (true);
CREATE POLICY "Anyone can manage regions" ON regions FOR ALL USING (true);
CREATE POLICY "Anyone can manage chapters" ON chapters FOR ALL USING (true);
CREATE POLICY "Anyone can manage counties" ON counties FOR ALL USING (true);

-- Create indexes for performance
CREATE INDEX idx_regions_division ON regions(division_id);
CREATE INDEX idx_chapters_region ON chapters(region_id);
CREATE INDEX idx_counties_chapter ON counties(chapter_id);
CREATE INDEX idx_counties_state ON counties(state);
CREATE INDEX idx_counties_fips ON counties(fips_code);

-- Add county reference to organizations and people tables
ALTER TABLE organizations 
ADD COLUMN IF NOT EXISTS county_id UUID REFERENCES counties(id);

ALTER TABLE people 
ADD COLUMN IF NOT EXISTS county_id UUID REFERENCES counties(id);

-- Insert sample Red Cross geographic hierarchy
-- Eastern Division
INSERT INTO divisions (name, code, description) VALUES 
    ('Eastern Division', 'EAST', 'Covers Northeast and Mid-Atlantic states'),
    ('Central Division', 'CENT', 'Covers Midwest states'),
    ('Southern Division', 'SOUTH', 'Covers Southeast and Gulf states'),
    ('Western Division', 'WEST', 'Covers Western and Pacific states')
ON CONFLICT (name) DO NOTHING;

-- Sample Regions (Eastern Division)
INSERT INTO regions (division_id, name, code, description) 
SELECT d.id, r.name, r.code, r.description
FROM divisions d, (VALUES 
    ('National Capital & Greater Chesapeake', 'NCGC', 'DC, MD, VA, WV'),
    ('Greater New York', 'GNY', 'NY, CT, NJ'),
    ('New England', 'NE', 'MA, ME, NH, VT, RI')
) AS r(name, code, description)
WHERE d.code = 'EAST'
ON CONFLICT DO NOTHING;

-- Sample Chapter (National Capital Region)
INSERT INTO chapters (region_id, name, code, address, city, state, zip, phone)
SELECT r.id, c.name, c.code, c.address, c.city, c.state, c.zip, c.phone
FROM regions r, (VALUES 
    ('National Capital & Greater Chesapeake', 'NCGC-HQ', '2025 E Street NW', 'Washington', 'DC', '20006', '202-303-4498')
) AS c(name, code, address, city, state, zip, phone)
WHERE r.code = 'NCGC'
ON CONFLICT DO NOTHING;

-- Sample Counties (DC Area)
INSERT INTO counties (chapter_id, county_name, state, fips_code, population)
SELECT c.id, co.county_name, co.state, co.fips_code, co.population
FROM chapters c, (VALUES 
    ('District of Columbia', 'DC', '11001', 689545),
    ('Fairfax County', 'VA', '51059', 1148433),
    ('Arlington County', 'VA', '51013', 236842),
    ('Montgomery County', 'MD', '24031', 1062061),
    ('Prince Georges County', 'MD', '24033', 967201)
) AS co(county_name, state, fips_code, population)
WHERE c.code = 'NCGC-HQ'
ON CONFLICT DO NOTHING;

-- Create a view for easy geographic lookup
CREATE OR REPLACE VIEW geographic_hierarchy AS
SELECT 
    c.id as county_id,
    c.county_name,
    c.state,
    c.fips_code,
    ch.name as chapter_name,
    r.name as region_name,
    d.name as division_name
FROM counties c
LEFT JOIN chapters ch ON c.chapter_id = ch.id
LEFT JOIN regions r ON ch.region_id = r.id
LEFT JOIN divisions d ON r.division_id = d.id;

-- Grant permissions
GRANT ALL ON divisions TO anon, authenticated;
GRANT ALL ON regions TO anon, authenticated;
GRANT ALL ON chapters TO anon, authenticated;
GRANT ALL ON counties TO anon, authenticated;
GRANT SELECT ON geographic_hierarchy TO anon, authenticated;

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'Geographic hierarchy tables created successfully';
    RAISE NOTICE 'Structure: Division > Region > Chapter > County';
END
$$;