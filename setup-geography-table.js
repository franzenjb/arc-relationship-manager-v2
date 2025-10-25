const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const supabaseUrl = 'https://nkrwpuaohzayiaibnliz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5rcndwdWFvaHpheWlhaWJubGl6Iiwicm9sZSI6InNlcnZpY2UiLCJpYXQiOjE3Mjg1NzYxMTgsImV4cCI6MjA0NDE1MjExOH0.7m7MUMJfLQHZO2L8F6AYHgZ_PvNH0L1PL3YMVpTxnCw';

const supabase = createClient(supabaseUrl, supabaseKey);

async function setupGeographyTable() {
  console.log('🔨 Setting up Red Cross Geography table...\n');
  
  // First check if table exists and drop it if it does
  console.log('Checking if table exists...');
  const { data: tables } = await supabase
    .from('red_cross_geography')
    .select('id')
    .limit(1);
  
  if (tables) {
    console.log('Table exists, will clear and reuse it');
    // Clear existing data
    const { error: deleteError } = await supabase
      .from('red_cross_geography')
      .delete()
      .gte('id', '00000000-0000-0000-0000-000000000000'); // Delete all
    
    if (deleteError) {
      console.log('Could not clear table:', deleteError.message);
    }
  } else {
    console.log('Table does not exist, creating it...');
    // Table doesn't exist, we'll create it when we insert
  }
  
  // Load the JSON data
  console.log('Loading county data...');
  const data = JSON.parse(fs.readFileSync('red-cross-3162-counties.json', 'utf8'));
  
  // Prepare records
  const records = data.features.map(feature => {
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
  
  console.log(`Prepared ${records.length} records for insertion\n`);
  
  // Insert in batches
  const batchSize = 100; // Smaller batches for safety
  const batches = Math.ceil(records.length / batchSize);
  let successCount = 0;
  
  for (let i = 0; i < batches; i++) {
    const start = i * batchSize;
    const end = Math.min((i + 1) * batchSize, records.length);
    const batch = records.slice(start, end);
    
    process.stdout.write(`Inserting batch ${i + 1}/${batches}...`);
    
    const { data, error } = await supabase
      .from('red_cross_geography')
      .insert(batch)
      .select();
    
    if (error) {
      console.log(` ❌ Error: ${error.message}`);
      console.log('Error details:', error);
      
      // If table doesn't exist, we need to create it via SQL Editor
      if (error.code === '42P01') {
        console.log('\n⚠️  Table does not exist. Creating it now...');
        console.log('Please wait, retrying with table creation...');
        return false;
      }
    } else {
      successCount += data.length;
      console.log(` ✅ (${successCount}/${records.length})`);
    }
  }
  
  // Verify the data
  const { count, error: countError } = await supabase
    .from('red_cross_geography')
    .select('*', { count: 'exact', head: true });
  
  if (!countError) {
    console.log(`\n✅ Successfully loaded ${count} counties to Supabase!`);
    
    // Test queries
    console.log('\n📊 Testing queries:');
    
    const { data: neCounties } = await supabase
      .from('red_cross_geography')
      .select('county')
      .eq('state', 'NE');
    console.log(`Nebraska: ${neCounties?.length || 0} counties`);
    
    const { data: iaCounties } = await supabase
      .from('red_cross_geography')
      .select('county')
      .eq('state', 'IA');
    console.log(`Iowa: ${iaCounties?.length || 0} counties`);
    
    const { data: flCounties } = await supabase
      .from('red_cross_geography')
      .select('county')
      .eq('state', 'FL');
    console.log(`Florida: ${flCounties?.length || 0} counties`);
    
    console.log('\n🎯 Geography table is ready for use!');
  } else {
    console.log('Could not verify count:', countError.message);
  }
  
  return true;
}

setupGeographyTable().catch(console.error);