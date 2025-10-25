const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

// Both Supabase instances
const databases = {
  'Gold Standard (Florida-only)': {
    url: 'https://arc-relationship-manager.vercel.app', // Need to find the actual Supabase URL
    // Will need to extract from the deployed app
  },
  'New Multi-Region': {
    url: 'https://yqucprgxgdnowjnzrtoz.supabase.co',
    serviceKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlxdWNwcmd4Z2Rub3dqbnpydG96Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTIyNDk3NywiZXhwIjoyMDc2ODAwOTc3fQ.agp1ctk_Kf-1aQrgkdhyJIhC1fRm_cvEtmPUxJuyXe0'
  }
};

async function executeSQL() {
  console.log('🔨 Creating geography tables directly...\n');
  
  // First, let's create the table in the multi-region database using raw SQL
  const supabase = createClient(
    databases['New Multi-Region'].url,
    databases['New Multi-Region'].serviceKey
  );
  
  // The SQL to create the table
  const createTableSQL = `
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
      hh_pop_2023 INTEGER,
      fam_pop_2023 INTEGER,
      pop_den_2023 NUMERIC,
      total_hh_2023 INTEGER,
      avg_hh_size_2023 NUMERIC,
      avg_fam_size_2023 NUMERIC,
      total_hu_2023 INTEGER,
      owner_2023 INTEGER,
      renter_2023 INTEGER,
      vacant_2023 INTEGER,
      med_home_val_2023 NUMERIC,
      avg_home_val_2023 NUMERIC,
      median_age_2023 NUMERIC,
      youth_0_14_pop_2023 INTEGER,
      yng_adult_15_24_pop_2023 INTEGER,
      adult_25_64_pop_2023 INTEGER,
      seniors_65_up_pop_2023 INTEGER,
      pop_white_2023 INTEGER,
      pop_black_2023 INTEGER,
      pop_am_indian_2023 INTEGER,
      pop_asian_2023 INTEGER,
      pop_pacific_2023 INTEGER,
      pop_other_2023 INTEGER,
      pop_2_plus_races_2023 INTEGER,
      hisp_pop_2023 INTEGER,
      diversity_index_2023 NUMERIC,
      med_hh_inc_2023 NUMERIC,
      avg_hh_inc_2023 NUMERIC,
      per_cap_inc_2023 NUMERIC,
      emp_pop_2023 INTEGER,
      unemp_pop_2023 INTEGER,
      unemp_rate_2023 NUMERIC,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
    
    CREATE INDEX IF NOT EXISTS idx_geography_state ON red_cross_geography(state);
    CREATE INDEX IF NOT EXISTS idx_geography_county ON red_cross_geography(county);
    CREATE INDEX IF NOT EXISTS idx_geography_division ON red_cross_geography(division);
    CREATE INDEX IF NOT EXISTS idx_geography_region ON red_cross_geography(region);
    CREATE INDEX IF NOT EXISTS idx_geography_chapter ON red_cross_geography(chapter);
    CREATE INDEX IF NOT EXISTS idx_geography_fips ON red_cross_geography(fips);
    CREATE INDEX IF NOT EXISTS idx_geography_geo_id ON red_cross_geography(geo_id);
    
    ALTER TABLE red_cross_geography ENABLE ROW LEVEL SECURITY;
    
    DROP POLICY IF EXISTS "Allow read access to geography" ON red_cross_geography;
    CREATE POLICY "Allow read access to geography" ON red_cross_geography FOR SELECT USING (true);
  `;
  
  try {
    // Try to execute SQL using the rpc function approach
    console.log('Attempting to create table...');
    
    const { data, error } = await supabase.rpc('exec', { 
      sql: createTableSQL 
    });
    
    if (error) {
      console.log('RPC approach failed:', error.message);
      console.log('\nI need to create this table manually. Let me show you exactly what to do:');
      console.log('\n🔗 Go to: https://supabase.com/dashboard/project/yqucprgxgdnowjnzrtoz/sql');
      console.log('\n📋 Copy and paste this SQL:');
      console.log(createTableSQL);
      console.log('\n✅ Then run this script again to load the data');
      return;
    }
    
    console.log('✅ Table created successfully!');
    
  } catch (error) {
    console.log('Direct SQL execution not available. Manual approach needed.');
    console.log('\n🎯 EXACT STEPS TO GET THIS DONE:');
    console.log('\n1. Open: https://supabase.com/dashboard/project/yqucprgxgdnowjnzrtoz/sql');
    console.log('2. Paste the SQL from the console output above');
    console.log('3. Click "Run"');
    console.log('4. Run: node create-and-load-geography.js');
    console.log('\nThat will create the table and load all 3,162 counties.');
  }
}

executeSQL().catch(console.error);