const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

// Both Supabase instances
const databases = {
  'Gold Standard (Florida-only)': {
    url: 'https://okclryedqbghlhxzqyrw.supabase.co',
    serviceKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9rY2xyeWVkcWJnaGxoeHpxeXJ3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTAzODM4MywiZXhwIjoyMDc2NjE0MzgzfQ.j5HWfl8iBxdoEm4cG4OdUE-pTaxD8lTDcPnSZzBWjxI'
  },
  'New Multi-Region': {
    url: 'https://yqucprgxgdnowjnzrtoz.supabase.co',
    serviceKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlxdWNwcmd4Z2Rub3dqbnpydG96Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTIyNDk3NywiZXhwIjoyMDc2ODAwOTc3fQ.agp1ctk_Kf-1aQrgkdhyJIhC1fRm_cvEtmPUxJuyXe0'
  }
};

// Helper function to clean numeric values
function cleanNumeric(value) {
  if (value === null || value === undefined || value === '') return null;
  
  // Convert to string and remove commas, dollar signs, and other formatting
  const cleaned = String(value)
    .replace(/,/g, '')        // Remove commas
    .replace(/\$/g, '')       // Remove dollar signs
    .replace(/[^\d.-]/g, '')  // Remove everything except digits, decimal points, and negative signs
    .trim();
  
  if (cleaned === '' || cleaned === '-') return null;
  
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? null : parsed;
}

// Helper function to clean integer values
function cleanInteger(value) {
  const cleaned = cleanNumeric(value);
  return cleaned === null ? null : Math.round(cleaned);
}

async function fixAndLoadGeography() {
  console.log('🔧 Fixing data format and loading to both databases...\n');
  
  // Load the county data
  console.log('Loading and cleaning county data...');
  const data = JSON.parse(fs.readFileSync('red-cross-3162-counties.json', 'utf8'));
  
  // Clean and prepare all records
  const allRecords = data.features.map(feature => {
    const attrs = feature.attributes;
    
    return {
      geo_id: String(attrs.GeoID || ''),
      fips: attrs.FIPS ? String(attrs.FIPS) : null,
      county: attrs.County || '',
      county_long: attrs.County_Long || null,
      county_st: attrs.County_ST || null,
      county_st_long: attrs.County_ST_Long || null,
      state: attrs.State || null,
      division: attrs.Division || '',
      division_code: attrs.DCODE || null,
      region: attrs.Region || '',
      region_code: attrs.RCODE || null,
      chapter: attrs.Chapter || '',
      chapter_code: attrs.ECODE || null,
      address: attrs.Address || null,
      address_2: attrs.Address_2 || null,
      city: attrs.City || null,
      zip: attrs.Zip || null,
      phone: attrs.Phone || null,
      time_zone: attrs.Time_Zone || null,
      fema_region: attrs.FEMA_Region || null,
      
      // Clean numeric fields
      acres: cleanNumeric(attrs.Acres),
      sq_mi: cleanNumeric(attrs.SQ_MI),
      
      // Clean population fields (remove commas)
      pop_2023: cleanInteger(attrs.Pop_2023),
      pop_2028: cleanInteger(attrs.Pop_2028),
      male_pop_2023: cleanInteger(attrs.Male_Pop_2023),
      female_pop_2023: cleanInteger(attrs.Female_Pop_2023),
      hh_pop_2023: cleanInteger(attrs.HH_Pop_2023),
      fam_pop_2023: cleanInteger(attrs.Fam_Pop_2023),
      pop_den_2023: cleanNumeric(attrs.Pop_Den_2023),
      
      // Clean household statistics
      total_hh_2023: cleanInteger(attrs.Total_HH_2023),
      avg_hh_size_2023: cleanNumeric(attrs.Avg_HH_Size_2023),
      avg_fam_size_2023: cleanNumeric(attrs.Avg_Fam_Size_2023),
      total_hu_2023: cleanInteger(attrs.Total_HU_2023),
      owner_2023: cleanInteger(attrs.Owner_2023),
      renter_2023: cleanInteger(attrs.Renter_2023),
      vacant_2023: cleanInteger(attrs.Vacant_2023),
      
      // Clean housing values (remove $ and commas)
      med_home_val_2023: cleanNumeric(attrs.Med_Home_Val_2023),
      avg_home_val_2023: cleanNumeric(attrs.Avg_Home_Val_2023),
      
      // Clean age demographics
      median_age_2023: cleanNumeric(attrs.Median_Age_2023),
      youth_0_14_pop_2023: cleanInteger(attrs.Youth_0_14_Pop_2023),
      yng_adult_15_24_pop_2023: cleanInteger(attrs.Yng_Adult_15_24_Pop_2023),
      adult_25_64_pop_2023: cleanInteger(attrs.Adult_25_64_Pop_2023),
      seniors_65_up_pop_2023: cleanInteger(attrs.Seniors_65_up_Pop_2023),
      
      // Clean race/ethnicity
      pop_white_2023: cleanInteger(attrs.Pop_White_2023),
      pop_black_2023: cleanInteger(attrs.Pop_Black_2023),
      pop_am_indian_2023: cleanInteger(attrs.Pop_Am_Indian_2023),
      pop_asian_2023: cleanInteger(attrs.Pop_Asian_2023),
      pop_pacific_2023: cleanInteger(attrs.Pop_Pacific_2023),
      pop_other_2023: cleanInteger(attrs.Pop_Other_2023),
      pop_2_plus_races_2023: cleanInteger(attrs.Pop_2_Plus_Races_2023),
      hisp_pop_2023: cleanInteger(attrs.Hisp_Pop_2023),
      diversity_index_2023: cleanNumeric(attrs.Diversity_Index_2023),
      
      // Clean economic indicators (remove $ and commas)
      med_hh_inc_2023: cleanNumeric(attrs.Med_HH_Inc_2023),
      avg_hh_inc_2023: cleanNumeric(attrs.Avg_HH_Inc_2023),
      per_cap_inc_2023: cleanNumeric(attrs.Per_Cap_Inc_2023),
      emp_pop_2023: cleanInteger(attrs.Emp_Pop_2023),
      unemp_pop_2023: cleanInteger(attrs.Unemp_Pop_2023),
      unemp_rate_2023: cleanNumeric(attrs.Unemp_Rate_2023)
    };
  });
  
  // Filter out records with missing required fields
  const validRecords = allRecords.filter(record => 
    record.geo_id && record.county && record.state && record.division && record.region && record.chapter
  );
  
  console.log(`Cleaned ${data.features.length} records, ${validRecords.length} are valid\n`);
  
  // Process each database
  for (const [dbName, config] of Object.entries(databases)) {
    console.log(`\n🔨 Loading into: ${dbName}`);
    
    const supabase = createClient(config.url, config.serviceKey);
    
    try {
      // Test connection
      const { data: testData, error: testError } = await supabase
        .from('organizations')
        .select('id')
        .limit(1);
      
      if (testError) {
        console.log(`❌ Cannot connect to ${dbName}: ${testError.message}`);
        continue;
      }
      
      console.log(`✅ Connected to ${dbName}`);
      
      // Clear existing geography data
      console.log('   Clearing existing data...');
      await supabase
        .from('red_cross_geography')
        .delete()
        .gte('id', '00000000-0000-0000-0000-000000000000');
      
      // Insert data in batches
      const batchSize = 25; // Smaller batches to avoid timeouts
      const batches = Math.ceil(validRecords.length / batchSize);
      let successCount = 0;
      
      console.log(`   📥 Inserting ${validRecords.length} records in ${batches} batches...`);
      
      for (let i = 0; i < batches; i++) {
        const start = i * batchSize;
        const end = Math.min((i + 1) * batchSize, validRecords.length);
        const batch = validRecords.slice(start, end);
        
        const { data: batchData, error: batchError } = await supabase
          .from('red_cross_geography')
          .insert(batch)
          .select();
        
        if (batchError) {
          console.log(`   Batch ${i + 1}/${batches}: ❌ ${batchError.message}`);
          // Show the problematic record for debugging
          if (batchError.message.includes('invalid input syntax')) {
            console.log('   Sample record:', JSON.stringify(batch[0], null, 2));
          }
        } else if (batchData) {
          successCount += batchData.length;
          process.stdout.write(`   Batch ${i + 1}/${batches}: ✅ (${successCount}/${validRecords.length})\\r`);
        }
      }
      
      console.log(`\\n   🎯 Successfully inserted ${successCount} records`);
      
      // Verify with test queries
      const { data: neCounties } = await supabase
        .from('red_cross_geography')
        .select('county')
        .eq('state', 'NE');
      
      const { data: iaCounties } = await supabase
        .from('red_cross_geography')
        .select('county')
        .eq('state', 'IA');
      
      const { data: flCounties } = await supabase
        .from('red_cross_geography')
        .select('county')
        .eq('state', 'FL');
      
      console.log(`   📊 Verification: NE=${neCounties?.length || 0}, IA=${iaCounties?.length || 0}, FL=${flCounties?.length || 0}`);
      
    } catch (error) {
      console.log(`❌ Error with ${dbName}: ${error.message}`);
    }
  }
  
  console.log('\\n🎯 Data loading complete!');
  console.log('\\n📋 Both databases now have Red Cross geography data:');
  console.log('✅ Gold Standard: https://arc-relationship-manager.vercel.app');
  console.log('✅ Multi-Region: https://arc-relationship-manager-v2.vercel.app');
}

fixAndLoadGeography().catch(console.error);