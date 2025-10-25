const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

// Use the CORRECT Supabase instance
const supabaseUrl = 'https://yqucprgxgdnowjnzrtoz.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlxdWNwcmd4Z2Rub3dqbnpydG96Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTIyNDk3NywiZXhwIjoyMDc2ODAwOTc3fQ.agp1ctk_Kf-1aQrgkdhyJIhC1fRm_cvEtmPUxJuyXe0';

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  db: { schema: 'public' },
  auth: { persistSession: false }
});

async function createAndLoadGeography() {
  console.log('📍 Creating and loading Red Cross Geography...\n');
  
  // Load the JSON data first
  console.log('Loading county data...');
  const data = JSON.parse(fs.readFileSync('red-cross-3162-counties.json', 'utf8'));
  
  // Create simplified records first to test
  const testRecords = data.features.slice(0, 5).map(feature => {
    const attrs = feature.attributes;
    
    return {
      geo_id: String(attrs.GeoID),
      fips: attrs.FIPS ? String(attrs.FIPS) : null,
      county: attrs.County,
      state: attrs.State,
      division: attrs.Division,
      region: attrs.Region,
      chapter: attrs.Chapter
    };
  });
  
  console.log('Testing with 5 records first...\n');
  console.log('Sample record:', testRecords[0]);
  
  // Try to insert - this will auto-create the table if it doesn't exist
  const { data: insertData, error: insertError } = await supabase
    .from('red_cross_geography')
    .insert(testRecords)
    .select();
  
  if (insertError) {
    console.log('Insert error:', insertError.message);
    
    // Table doesn't exist, we need to create it via SQL
    console.log('\n📋 The table needs to be created. Here\'s what to do:\n');
    console.log('1. Go to: https://supabase.com/dashboard/project/yqucprgxgdnowjnzrtoz/sql');
    console.log('2. Run this SQL:\n');
    
    // Print simplified CREATE TABLE statement
    console.log(`
CREATE TABLE IF NOT EXISTS red_cross_geography (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  geo_id TEXT UNIQUE NOT NULL,
  fips TEXT,
  county TEXT NOT NULL,
  county_long TEXT,
  county_st TEXT,
  county_st_long TEXT,
  state TEXT NOT NULL,
  division TEXT NOT NULL,
  division_code TEXT,
  region TEXT NOT NULL,
  region_code TEXT,
  chapter TEXT NOT NULL,
  chapter_code TEXT,
  address TEXT,
  address_2 TEXT,
  city TEXT,
  zip TEXT,
  phone TEXT,
  time_zone TEXT,
  fema_region TEXT,
  acres NUMERIC,
  sq_mi NUMERIC,
  pop_2023 INTEGER,
  pop_2028 INTEGER,
  male_pop_2023 INTEGER,
  female_pop_2023 INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_geography_state ON red_cross_geography(state);
CREATE INDEX idx_geography_county ON red_cross_geography(county);
CREATE INDEX idx_geography_division ON red_cross_geography(division);
CREATE INDEX idx_geography_region ON red_cross_geography(region);
CREATE INDEX idx_geography_chapter ON red_cross_geography(chapter);

ALTER TABLE red_cross_geography ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow read access to geography" ON red_cross_geography
  FOR SELECT USING (true);
`);
    
    console.log('\n3. After creating the table, run this script again.');
    return;
  }
  
  console.log('✅ Test insert successful!');
  console.log(`Inserted ${insertData.length} test records\n`);
  
  // Now prepare all records
  console.log('Preparing all 3,162 records...');
  const allRecords = data.features.map(feature => {
    const attrs = feature.attributes;
    
    return {
      geo_id: String(attrs.GeoID),
      fips: attrs.FIPS ? String(attrs.FIPS) : null,
      county: attrs.County,
      county_long: attrs.County_Long,
      county_st: attrs.County_ST,
      county_st_long: attrs.County_ST_Long,
      state: attrs.State,
      division: attrs.Division,
      division_code: attrs.DCODE,
      region: attrs.Region,
      region_code: attrs.RCODE,
      chapter: attrs.Chapter,
      chapter_code: attrs.ECODE,
      address: attrs.Address,
      address_2: attrs.Address_2,
      city: attrs.City,
      zip: attrs.Zip,
      phone: attrs.Phone,
      time_zone: attrs.Time_Zone,
      fema_region: attrs.FEMA_Region,
      acres: attrs.Acres,
      sq_mi: attrs.SQ_MI,
      pop_2023: attrs.Pop_2023,
      pop_2028: attrs.Pop_2028,
      male_pop_2023: attrs.Male_Pop_2023,
      female_pop_2023: attrs.Female_Pop_2023
    };
  });
  
  // Clear existing data
  console.log('Clearing existing data...');
  await supabase
    .from('red_cross_geography')
    .delete()
    .gte('id', '00000000-0000-0000-0000-000000000000');
  
  // Insert in batches
  const batchSize = 100;
  const batches = Math.ceil(allRecords.length / batchSize);
  let successCount = 0;
  
  console.log(`Inserting ${allRecords.length} records in ${batches} batches...\n`);
  
  for (let i = 0; i < batches; i++) {
    const start = i * batchSize;
    const end = Math.min((i + 1) * batchSize, allRecords.length);
    const batch = allRecords.slice(start, end);
    
    const { data: batchData, error: batchError } = await supabase
      .from('red_cross_geography')
      .insert(batch)
      .select();
    
    if (batchError) {
      console.log(`Batch ${i + 1}/${batches}: ❌ ${batchError.message}`);
    } else if (batchData) {
      successCount += batchData.length;
      console.log(`Batch ${i + 1}/${batches}: ✅ (${successCount}/${allRecords.length})`);
    }
  }
  
  // Verify
  const { count } = await supabase
    .from('red_cross_geography')
    .select('*', { count: 'exact', head: true });
  
  console.log(`\n🎯 Final count: ${count} counties in database`);
  
  // Test queries
  const { data: states } = await supabase
    .from('red_cross_geography')
    .select('state')
    .eq('division', 'North Central Division');
  
  console.log(`North Central Division states: ${new Set(states?.map(s => s.state)).size} unique states`);
}

createAndLoadGeography().catch(console.error);