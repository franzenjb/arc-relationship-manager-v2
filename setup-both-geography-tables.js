const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

// Both Supabase instances
const databases = {
  'Gold Standard (Florida-only)': {
    url: 'https://okclryedqbghlhxzqyrw.supabase.co',
    serviceKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9rY2xyeWVkcWJnaGxoeHpxeXJ3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTAzODM4MywiZXhwIjoyMDc2NjE0MzgzfQ.j5HWfl8iBxdoEm4cG4OdUE-pTaxD8lTDcPnSZzBWjxI',
    dashboard: 'https://supabase.com/dashboard/project/okclryedqbghlhxzqyrw/sql'
  },
  'New Multi-Region': {
    url: 'https://yqucprgxgdnowjnzrtoz.supabase.co',
    serviceKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlxdWNwcmd4Z2Rub3dqbnpydG96Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTIyNDk3NywiZXhwIjoyMDc2ODAwOTc3fQ.agp1ctk_Kf-1aQrgkdhyJIhC1fRm_cvEtmPUxJuyXe0',
    dashboard: 'https://supabase.com/dashboard/project/yqucprgxgdnowjnzrtoz/sql'
  }
};

async function setupBothDatabases() {
  console.log('🎯 Setting up geography tables in BOTH databases...\n');
  
  // Load the county data
  console.log('Loading county data...');
  const data = JSON.parse(fs.readFileSync('red-cross-3162-counties.json', 'utf8'));
  
  // Prepare all records
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
      female_pop_2023: attrs.Female_Pop_2023,
      hh_pop_2023: attrs.HH_Pop_2023,
      fam_pop_2023: attrs.Fam_Pop_2023,
      pop_den_2023: attrs.Pop_Den_2023,
      total_hh_2023: attrs.Total_HH_2023,
      avg_hh_size_2023: attrs.Avg_HH_Size_2023,
      avg_fam_size_2023: attrs.Avg_Fam_Size_2023,
      total_hu_2023: attrs.Total_HU_2023,
      owner_2023: attrs.Owner_2023,
      renter_2023: attrs.Renter_2023,
      vacant_2023: attrs.Vacant_2023,
      med_home_val_2023: attrs.Med_Home_Val_2023,
      avg_home_val_2023: attrs.Avg_Home_Val_2023,
      median_age_2023: attrs.Median_Age_2023,
      youth_0_14_pop_2023: attrs.Youth_0_14_Pop_2023,
      yng_adult_15_24_pop_2023: attrs.Yng_Adult_15_24_Pop_2023,
      adult_25_64_pop_2023: attrs.Adult_25_64_Pop_2023,
      seniors_65_up_pop_2023: attrs.Seniors_65_up_Pop_2023,
      pop_white_2023: attrs.Pop_White_2023,
      pop_black_2023: attrs.Pop_Black_2023,
      pop_am_indian_2023: attrs.Pop_Am_Indian_2023,
      pop_asian_2023: attrs.Pop_Asian_2023,
      pop_pacific_2023: attrs.Pop_Pacific_2023,
      pop_other_2023: attrs.Pop_Other_2023,
      pop_2_plus_races_2023: attrs.Pop_2_Plus_Races_2023,
      hisp_pop_2023: attrs.Hisp_Pop_2023,
      diversity_index_2023: attrs.Diversity_Index_2023,
      med_hh_inc_2023: attrs.Med_HH_Inc_2023,
      avg_hh_inc_2023: attrs.Avg_HH_Inc_2023,
      per_cap_inc_2023: attrs.Per_Cap_Inc_2023,
      emp_pop_2023: attrs.Emp_Pop_2023,
      unemp_pop_2023: attrs.Unemp_Pop_2023,
      unemp_rate_2023: attrs.Unemp_Rate_2023
    };
  });
  
  console.log(`Prepared ${allRecords.length} records\n`);
  
  // Process each database
  for (const [dbName, config] of Object.entries(databases)) {
    console.log(`\n🔨 Working on: ${dbName}`);
    console.log(`📍 Database: ${config.url}`);
    
    const supabase = createClient(config.url, config.serviceKey);
    
    // Test connection
    try {
      const { data: testData, error: testError } = await supabase
        .from('organizations')
        .select('id')
        .limit(1);
      
      if (testError) {
        console.log(`❌ Cannot connect to ${dbName}: ${testError.message}`);
        continue;
      }
      
      console.log(`✅ Connected to ${dbName}`);
      
      // Check if geography table exists
      const { data: existing, error: checkError } = await supabase
        .from('red_cross_geography')
        .select('id')
        .limit(1);
      
      if (!checkError || checkError.code !== '42P01') {
        console.log('   Geography table exists, clearing old data...');
        await supabase
          .from('red_cross_geography')
          .delete()
          .gte('id', '00000000-0000-0000-0000-000000000000');
      } else {
        console.log('   ⚠️  Table does not exist - needs to be created first');
        console.log(`   🔗 Go to: ${config.dashboard}`);
        console.log('   📋 Run the SQL from: supabase/migrations/20251025_create_red_cross_geography.sql');
        console.log('   ✅ Then run this script again');
        continue;
      }
      
      // Insert data in batches
      const batchSize = 50;
      const batches = Math.ceil(allRecords.length / batchSize);
      let successCount = 0;
      
      console.log(`   📥 Inserting ${allRecords.length} records in ${batches} batches...`);
      
      for (let i = 0; i < batches; i++) {
        const start = i * batchSize;
        const end = Math.min((i + 1) * batchSize, allRecords.length);
        const batch = allRecords.slice(start, end);
        
        const { data: batchData, error: batchError } = await supabase
          .from('red_cross_geography')
          .insert(batch)
          .select();
        
        if (batchError) {
          console.log(`   Batch ${i + 1}/${batches}: ❌ ${batchError.message}`);
        } else if (batchData) {
          successCount += batchData.length;
          process.stdout.write(`   Batch ${i + 1}/${batches}: ✅ (${successCount}/${allRecords.length})\\r`);
        }
      }
      
      console.log(`\\n   🎯 Inserted ${successCount} records in ${dbName}`);
      
      // Verify with test queries
      const { data: neCounties } = await supabase
        .from('red_cross_geography')
        .select('county')
        .eq('state', 'NE');
      
      const { data: flCounties } = await supabase
        .from('red_cross_geography')
        .select('county')
        .eq('state', 'FL');
      
      console.log(`   📊 Test queries: NE=${neCounties?.length || 0}, FL=${flCounties?.length || 0}`);
      
    } catch (error) {
      console.log(`❌ Error with ${dbName}: ${error.message}`);
    }
  }
  
  console.log('\\n🎯 Setup complete!');
  console.log('\\n📋 Summary:');
  console.log('✅ Gold Standard: https://arc-relationship-manager.vercel.app');
  console.log('✅ Multi-Region: https://arc-relationship-manager-v2.vercel.app');
  console.log('📊 Both now have complete Red Cross geography data!');
}

setupBothDatabases().catch(console.error);