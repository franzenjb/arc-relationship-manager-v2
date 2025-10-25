const fs = require('fs');

// Load the county data
const data = JSON.parse(fs.readFileSync('red-cross-3162-counties.json', 'utf8'));

console.log('📊 Creating comprehensive CSV with all data...\n');

// Define all the fields we want to include
const csvHeaders = [
  // Geographic Identifiers
  'GeoID',
  'FIPS',
  'County',
  'County_Long',
  'State',
  'State_Long',
  
  // Red Cross Hierarchy
  'Division',
  'Division_Code',
  'Region', 
  'Region_Code',
  'Chapter',
  'Chapter_Code',
  
  // Chapter Contact Info
  'Chapter_Address',
  'Chapter_Address_2', 
  'Chapter_City',
  'Chapter_State',
  'Chapter_Zip',
  'Chapter_Phone',
  'Time_Zone',
  'FEMA_Region',
  
  // Geographic Metrics
  'Acres',
  'Square_Miles',
  
  // 2023 Population Demographics
  'Population_2023',
  'Population_2028_Projected',
  'Male_Population_2023',
  'Female_Population_2023',
  'Household_Population_2023',
  'Family_Population_2023',
  'Population_Density_2023',
  
  // Household Statistics
  'Total_Households_2023',
  'Average_Household_Size_2023',
  'Average_Family_Size_2023',
  'Total_Housing_Units_2023',
  'Owner_Occupied_Units_2023',
  'Renter_Occupied_Units_2023',
  'Vacant_Units_2023',
  
  // Housing Values
  'Median_Home_Value_2023',
  'Average_Home_Value_2023',
  
  // Age Demographics
  'Median_Age_2023',
  'Youth_0_to_14_Population_2023',
  'Young_Adult_15_to_24_Population_2023',
  'Adult_25_to_64_Population_2023',
  'Seniors_65_Plus_Population_2023',
  
  // Race and Ethnicity
  'White_Population_2023',
  'Black_Population_2023',
  'American_Indian_Population_2023',
  'Asian_Population_2023',
  'Pacific_Islander_Population_2023',
  'Other_Race_Population_2023',
  'Two_Plus_Races_Population_2023',
  'Hispanic_Population_2023',
  'Diversity_Index_2023',
  
  // Economic Indicators
  'Median_Household_Income_2023',
  'Average_Household_Income_2023',
  'Per_Capita_Income_2023',
  'Employed_Population_2023',
  'Unemployed_Population_2023',
  'Unemployment_Rate_2023'
];

// Create CSV content
let csvContent = csvHeaders.join(',') + '\n';

// Process each county
data.features.forEach(feature => {
  const attrs = feature.attributes;
  
  const row = [
    // Geographic Identifiers
    attrs.GeoID || '',
    attrs.FIPS || '',
    attrs.County || '',
    attrs.County_Long || '',
    attrs.State || '',
    attrs.County_ST_Long || '',
    
    // Red Cross Hierarchy
    attrs.Division || '',
    attrs.DCODE || '',
    attrs.Region || '',
    attrs.RCODE || '',
    attrs.Chapter || '',
    attrs.ECODE || '',
    
    // Chapter Contact Info
    attrs.Address || '',
    attrs.Address_2 || '',
    attrs.City || '',
    attrs.State || '',
    attrs.Zip || '',
    attrs.Phone || '',
    attrs.Time_Zone || '',
    attrs.FEMA_Region || '',
    
    // Geographic Metrics
    attrs.Acres || '',
    attrs.SQ_MI || '',
    
    // 2023 Population Demographics
    attrs.Pop_2023 || '',
    attrs.Pop_2028 || '',
    attrs.Male_Pop_2023 || '',
    attrs.Female_Pop_2023 || '',
    attrs.HH_Pop_2023 || '',
    attrs.Fam_Pop_2023 || '',
    attrs.Pop_Den_2023 || '',
    
    // Household Statistics
    attrs.Total_HH_2023 || '',
    attrs.Avg_HH_Size_2023 || '',
    attrs.Avg_Fam_Size_2023 || '',
    attrs.Total_HU_2023 || '',
    attrs.Owner_2023 || '',
    attrs.Renter_2023 || '',
    attrs.Vacant_2023 || '',
    
    // Housing Values
    attrs.Med_Home_Val_2023 || '',
    attrs.Avg_Home_Val_2023 || '',
    
    // Age Demographics
    attrs.Median_Age_2023 || '',
    attrs.Youth_0_14_Pop_2023 || '',
    attrs.Yng_Adult_15_24_Pop_2023 || '',
    attrs.Adult_25_64_Pop_2023 || '',
    attrs.Seniors_65_up_Pop_2023 || '',
    
    // Race and Ethnicity
    attrs.Pop_White_2023 || '',
    attrs.Pop_Black_2023 || '',
    attrs.Pop_Am_Indian_2023 || '',
    attrs.Pop_Asian_2023 || '',
    attrs.Pop_Pacific_2023 || '',
    attrs.Pop_Other_2023 || '',
    attrs.Pop_2_Plus_Races_2023 || '',
    attrs.Hisp_Pop_2023 || '',
    attrs.Diversity_Index_2023 || '',
    
    // Economic Indicators
    attrs.Med_HH_Inc_2023 || '',
    attrs.Avg_HH_Inc_2023 || '',
    attrs.Per_Cap_Inc_2023 || '',
    attrs.Emp_Pop_2023 || '',
    attrs.Unemp_Pop_2023 || '',
    attrs.Unemp_Rate_2023 || ''
  ];
  
  // Escape and quote values that contain commas or quotes
  const processedRow = row.map(value => {
    const stringValue = String(value);
    // If value contains comma, newline, or quote, wrap in quotes and escape internal quotes
    if (stringValue.includes(',') || stringValue.includes('\n') || stringValue.includes('"')) {
      return '"' + stringValue.replace(/"/g, '""') + '"';
    }
    return stringValue;
  });
  
  csvContent += processedRow.join(',') + '\n';
});

// Save to desktop
const desktopPath = process.env.HOME + '/Desktop/Red_Cross_Counties_Complete_Demographics.csv';
fs.writeFileSync(desktopPath, csvContent);

console.log(`✅ Created comprehensive CSV file:`);
console.log(`📁 Location: ~/Desktop/Red_Cross_Counties_Complete_Demographics.csv`);
console.log(`📊 Records: ${data.features.length} counties`);
console.log(`📋 Fields: ${csvHeaders.length} columns`);

// Print file size
const stats = fs.statSync(desktopPath);
const fileSizeInMB = (stats.size / (1024 * 1024)).toFixed(2);
console.log(`💾 File size: ${fileSizeInMB} MB`);

// Show sample of what's included
console.log('\n📝 Sample data structure:');
console.log('First 5 columns of first row:');
const firstRow = data.features[0].attributes;
console.log(`${firstRow.County}, ${firstRow.State} - ${firstRow.Chapter} - ${firstRow.Region} - ${firstRow.Division}`);

console.log('\n🎯 This file includes:');
console.log('- All 3,162 US counties');
console.log('- Complete Red Cross hierarchy (Division → Region → Chapter → County)');
console.log('- Chapter contact information');
console.log('- 2023 demographic data');
console.log('- Population, housing, age, race, and economic statistics');
console.log('- Ready to share with your coworker!');

// Also copy to iCloud Desktop if it exists
const iCloudDesktop = process.env.HOME + '/Library/Mobile Documents/com~apple~CloudDocs/Desktop';
try {
  if (fs.existsSync(iCloudDesktop)) {
    const iCloudPath = iCloudDesktop + '/Red_Cross_Counties_Complete_Demographics.csv';
    fs.copyFileSync(desktopPath, iCloudPath);
    console.log('\n☁️ Also saved to iCloud Desktop for easy sharing!');
  }
} catch (error) {
  console.log('\n📱 Note: Could not copy to iCloud Desktop (may not be enabled)');
}