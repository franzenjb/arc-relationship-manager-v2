const https = require('https');
const fs = require('fs');

// ArcGIS Feature Service URL based on the item ID
const itemId = 'f3f38f8e35884d23950e1842faa861d0';
const baseUrl = 'https://services9.arcgis.com/DnvQXULO8X0tu8qv/arcgis/rest/services';

async function fetchArcGISData() {
  console.log('🗺️ Fetching Red Cross Geographic Data from ArcGIS...\n');
  
  // First, try to find the feature service
  const possibleUrls = [
    `${baseUrl}/Master_RC_Geo_County_2025/FeatureServer/0/query?where=1%3D1&outFields=*&f=json&resultRecordCount=100`,
    `https://services.arcgis.com/DnvQXULO8X0tu8qv/arcgis/rest/services/Master_RC_Geo_County_2025/FeatureServer/0/query?where=1%3D1&outFields=*&f=json&resultRecordCount=100`,
    `https://services9.arcgis.com/DnvQXULO8X0tu8qv/arcgis/rest/services/Master_RC_Geo_County_2025/FeatureServer/0/query?where=1%3D1&outFields=*&f=json&resultRecordCount=100`
  ];
  
  for (const url of possibleUrls) {
    console.log(`Trying: ${url.substring(0, 80)}...`);
    
    try {
      const data = await fetchFromUrl(url);
      if (data) {
        const jsonData = JSON.parse(data);
        
        if (jsonData.features && jsonData.features.length > 0) {
          console.log(`\n✅ Found ${jsonData.features.length} records!`);
          
          // Extract unique divisions, regions, chapters
          const divisions = new Set();
          const regions = new Set();
          const chapters = new Set();
          const states = new Set();
          
          jsonData.features.forEach(feature => {
            const attrs = feature.attributes;
            if (attrs.Division) divisions.add(attrs.Division);
            if (attrs.Region) regions.add(attrs.Region);
            if (attrs.Chapter) chapters.add(attrs.Chapter);
            if (attrs.STATE_NAME) states.add(attrs.STATE_NAME);
          });
          
          console.log('\n📊 Data Summary:');
          console.log(`   Divisions: ${divisions.size}`);
          console.log(`   Regions: ${regions.size}`);
          console.log(`   Chapters: ${chapters.size}`);
          console.log(`   States: ${states.size}`);
          
          // Show sample data
          console.log('\n📝 Sample Records:');
          jsonData.features.slice(0, 5).forEach(feature => {
            const attrs = feature.attributes;
            console.log(`   ${attrs.COUNTY_NAME}, ${attrs.STATE_NAME}`);
            console.log(`     - Division: ${attrs.Division}`);
            console.log(`     - Region: ${attrs.Region}`);
            console.log(`     - Chapter: ${attrs.Chapter}`);
          });
          
          // Save to file
          fs.writeFileSync('red-cross-counties.json', JSON.stringify(jsonData, null, 2));
          console.log('\n💾 Full data saved to red-cross-counties.json');
          
          // Now fetch ALL records (not just 100)
          console.log('\n🔄 Fetching ALL records...');
          const fullUrl = url.replace('resultRecordCount=100', 'resultRecordCount=5000');
          const fullData = await fetchFromUrl(fullUrl);
          if (fullData) {
            const fullJsonData = JSON.parse(fullData);
            console.log(`✅ Fetched ${fullJsonData.features.length} total records!`);
            
            // Save full dataset
            fs.writeFileSync('red-cross-counties-full.json', JSON.stringify(fullJsonData, null, 2));
            console.log('💾 Full dataset saved to red-cross-counties-full.json');
            
            // Create a simplified structure for our app
            createSimplifiedStructure(fullJsonData);
          }
          
          return;
        }
      }
    } catch (error) {
      console.log(`   ❌ Failed: ${error.message}`);
    }
  }
  
  console.log('\n❌ Could not fetch data. The service might need authentication or a different URL.');
  console.log('Please check if the data is truly public or provide the direct FeatureServer URL.');
}

function fetchFromUrl(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

function createSimplifiedStructure(jsonData) {
  const structure = {
    divisions: {},
    totalCounties: jsonData.features.length,
    generated: new Date().toISOString()
  };
  
  // Organize by division -> region -> chapter -> counties
  jsonData.features.forEach(feature => {
    const attrs = feature.attributes;
    const division = attrs.Division || 'Unknown';
    const region = attrs.Region || 'Unknown';
    const chapter = attrs.Chapter || 'Unknown';
    const county = attrs.COUNTY_NAME;
    const state = attrs.STATE_NAME;
    const stateAbbr = attrs.STATE_ABBR;
    
    // Initialize structures
    if (!structure.divisions[division]) {
      structure.divisions[division] = {
        name: division,
        regions: {}
      };
    }
    
    if (!structure.divisions[division].regions[region]) {
      structure.divisions[division].regions[region] = {
        name: region,
        chapters: {}
      };
    }
    
    if (!structure.divisions[division].regions[region].chapters[chapter]) {
      structure.divisions[division].regions[region].chapters[chapter] = {
        name: chapter,
        counties: []
      };
    }
    
    // Add county
    structure.divisions[division].regions[region].chapters[chapter].counties.push({
      name: county,
      state: state,
      stateAbbr: stateAbbr,
      fips: attrs.FIPS,
      chapterAddress: attrs.Chapter_Address,
      chapterCity: attrs.Chapter_City,
      chapterState: attrs.Chapter_State,
      chapterZip: attrs.Chapter_Zip,
      chapterPhone: attrs.Chapter_Phone
    });
  });
  
  // Save simplified structure
  fs.writeFileSync('red-cross-structure.json', JSON.stringify(structure, null, 2));
  console.log('\n📁 Simplified structure saved to red-cross-structure.json');
  
  // Print summary
  console.log('\n🎯 Geographic Hierarchy:');
  Object.entries(structure.divisions).forEach(([divName, divData]) => {
    const regionCount = Object.keys(divData.regions).length;
    let chapterCount = 0;
    let countyCount = 0;
    
    Object.values(divData.regions).forEach(region => {
      chapterCount += Object.keys(region.chapters).length;
      Object.values(region.chapters).forEach(chapter => {
        countyCount += chapter.counties.length;
      });
    });
    
    console.log(`\n${divName}:`);
    console.log(`  - ${regionCount} regions`);
    console.log(`  - ${chapterCount} chapters`);
    console.log(`  - ${countyCount} counties`);
  });
}

fetchArcGISData();