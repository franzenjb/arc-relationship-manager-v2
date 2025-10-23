// Simple data insertion using only what we know works
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://okclryedqbghlhxzqyrw.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9rY2xyeWVkcWJnaGxoeHpxeXJ3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTAzODM4MywiZXhwIjoyMDc2NjE0MzgzfQ.j5HWfl8iBxdoEm4cG4OdUE-pTaxD8lTDcPnSZzBWjxI'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function insertBasicData() {
  console.log('🚀 Inserting basic data to test what works...')
  
  try {
    // Try the simplest possible insert first
    const { data, error } = await supabase
      .from('organizations')
      .insert({ 
        name: 'FEMA Region III'
      })
      .select()
    
    if (error) {
      console.log('❌ Basic insert failed:', error.message)
      console.log('\n💡 The issue is that the database tables need to be created first')
      console.log('📋 Here is the EXACT SQL you need to run in Supabase dashboard:')
      console.log('🌐 Go to: https://supabase.com/dashboard/project/okclryedqbghlhxzqyrw/sql')
      console.log('\n' + '='.repeat(80))
      console.log('-- COPY AND PASTE THIS SQL INTO SUPABASE DASHBOARD:')
      console.log('='.repeat(80))
      
      const sql = `-- ARC Relationship Manager Database Setup
DROP TABLE IF EXISTS meetings CASCADE;
DROP TABLE IF EXISTS people CASCADE;
DROP TABLE IF EXISTS organizations CASCADE;

CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  mission_area TEXT,
  organization_type TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  zip TEXT,
  website TEXT,
  phone TEXT,
  notes TEXT,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE people (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  first_name TEXT,
  last_name TEXT,
  title TEXT,
  email TEXT,
  phone TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE meetings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  location TEXT,
  summary TEXT,
  follow_up_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE people ENABLE ROW LEVEL SECURITY;
ALTER TABLE meetings ENABLE ROW LEVEL SECURITY;

-- Create policies for public access
CREATE POLICY "Enable all access" ON organizations FOR ALL USING (true);
CREATE POLICY "Enable all access" ON people FOR ALL USING (true);
CREATE POLICY "Enable all access" ON meetings FOR ALL USING (true);

-- Insert sample data
INSERT INTO organizations (name, mission_area, organization_type, address, city, state, zip, website, phone, notes, status) VALUES
('FEMA Region III', 'disaster_relief', 'government', '615 Chestnut Street', 'Philadelphia', 'PA', '19106', 'https://www.fema.gov/region-iii', '(215) 931-5500', 'Federal emergency management coordination', 'active'),
('Johns Hopkins Hospital', 'health_safety', 'healthcare', '1800 Orleans Street', 'Baltimore', 'MD', '21287', 'https://www.hopkinsmedicine.org', '(410) 955-5000', 'Major medical center partnership', 'active'),
('Salvation Army NCA', 'disaster_relief', 'nonprofit', '2626 Pennsylvania Avenue NW', 'Washington', 'DC', '20037', 'https://salvationarmynca.org', '(202) 756-2600', 'Emergency shelter and services', 'active'),
('Amazon Web Services', 'disaster_relief', 'business', '410 Terry Avenue North', 'Seattle', 'WA', '98109', 'https://aws.amazon.com', '(206) 266-1000', 'Cloud infrastructure solutions', 'active'),
('Washington National Cathedral', 'disaster_relief', 'faith_based', '3101 Wisconsin Avenue NW', 'Washington', 'DC', '20016', 'https://cathedral.org', '(202) 537-6200', 'Interfaith disaster response', 'active');`
      
      console.log(sql)
      console.log('='.repeat(80))
      console.log('\n✅ After running this SQL, your app will work perfectly!')
      console.log('🌐 Then visit: http://localhost:3000')
      
    } else {
      console.log('✅ Basic insert worked! Table exists:', data)
    }

  } catch (error) {
    console.error('❌ Error:', error.message)
  }
}

insertBasicData()