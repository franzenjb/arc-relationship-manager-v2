const https = require('https');
const fs = require('fs');

// The correct county-level service we found
const countyServiceUrl = 'https://services.arcgis.com/pGfbNJoYypmNq86F/arcgis/rest/services/Dissolve_Updated_Master_ARC_Geography_FY25_July_2024___Master_RC_Geo_County_2025/FeatureServer/0';

async function fetchCountyData() {
  console.log('🎯 Fetching Red Cross COUNTY data (not chapters)...\n');
  
  try {
    // First get the count
    const countUrl = `${countyServiceUrl}/query?where=1%3D1&returnCountOnly=true&f=json`;
    console.log('Getting record count...');
    
    const countData = await fetchFromUrl(countUrl);
    const countJson = JSON.parse(countData);
    
    console.log(`Found ${countJson.count} records! (Should be 3,162 counties)\n`);
    
    if (countJson.count > 0) {
      // Get field information
      const fieldsUrl = `${countyServiceUrl}?f=json`;
      const fieldsData = await fetchFromUrl(fieldsUrl);
      const fieldsJson = JSON.parse(fieldsData);
      
      if (fieldsJson.fields) {
        console.log('Available fields:');
        fieldsJson.fields.forEach(field => {
          if (!['Shape', 'Shape__Area', 'Shape__Length', 'OBJECTID'].includes(field.name)) {
            console.log(`  - ${field.name} (${field.type})`);
          }
        });
      }
      
      // Fetch sample data
      console.log('\nFetching sample counties...');
      const sampleUrl = `${countyServiceUrl}/query?where=STATE_ABBR%20IN%20('NE'%2C'IA')&outFields=*&f=json&resultRecordCount=10`;
      const sampleData = await fetchFromUrl(sampleUrl);
      const sampleJson = JSON.parse(sampleData);
      
      if (sampleJson.features && sampleJson.features.length > 0) {
        console.log('\nSample Nebraska/Iowa counties:');
        sampleJson.features.forEach((f, i) => {
          const attrs = f.attributes;
          console.log(`\n${i + 1}. ${attrs.COUNTY_NAME || attrs.County}, ${attrs.STATE_ABBR || attrs.State}`);
          console.log(`   Division: ${attrs.Division}`);
          console.log(`   Region: ${attrs.Region}`);
          console.log(`   Chapter: ${attrs.Chapter}`);
        });
      }
      
      // Fetch ALL data
      console.log('\n📥 Fetching ALL county records...');
      await fetchAllCounties(countJson.count);
      
    } else {
      console.log('No records found. This might not be the right service.');
    }
    
  } catch (error) {
    console.error('Error:', error.message);
    console.log('\nTrying alternate approach...');
    
    // Try without the "Dissolve_" prefix
    const altUrl = 'https://services.arcgis.com/pGfbNJoYypmNq86F/arcgis/rest/services/Updated_Master_ARC_Geography_FY25_July_2024___Master_RC_Geo_County_2025/FeatureServer/0';
    await tryAlternateUrl(altUrl);
  }
}

async function fetchAllCounties(totalCount) {
  const allFeatures = [];
  const batchSize = 1000;
  const batches = Math.ceil(totalCount / batchSize);
  
  for (let i = 0; i < batches; i++) {
    const offset = i * batchSize;
    const queryUrl = `${countyServiceUrl}/query?where=1%3D1&outFields=*&f=json&resultOffset=${offset}&resultRecordCount=${batchSize}`;
    
    console.log(`Fetching batch ${i + 1}/${batches} (records ${offset + 1}-${Math.min(offset + batchSize, totalCount)})...`);
    
    try {
      const batchData = await fetchFromUrl(queryUrl);
      const batchJson = JSON.parse(batchData);
      
      if (batchJson.features) {
        allFeatures.push(...batchJson.features);
      }
    } catch (error) {
      console.log(`Error in batch ${i + 1}:`, error.message);
    }
  }
  
  console.log(`\n✅ Successfully fetched ${allFeatures.length} county records!`);
  
  // Save to JSON
  fs.writeFileSync('red-cross-all-counties.json', JSON.stringify({ features: allFeatures }, null, 2));
  console.log('💾 Saved to red-cross-all-counties.json');
  
  // Create CSV
  createCountyCSV(allFeatures);
  
  // Analyze the data
  analyzeCounties(allFeatures);
}

function createCountyCSV(features) {
  if (!features.length) return;
  
  const headers = ['COUNTY_NAME', 'STATE_ABBR', 'STATE_NAME', 'Division', 'Region', 'Chapter', 
                   'Chapter_Address', 'Chapter_City', 'Chapter_State', 'Chapter_Zip', 'Chapter_Phone', 'FIPS'];
  
  let csv = headers.join(',') + '\n';
  
  features.forEach(feature => {
    const attrs = feature.attributes;
    const row = headers.map(header => {
      let value = attrs[header] || '';
      value = String(value).replace(/"/g, '""');
      return value.includes(',') ? `"${value}"` : value;
    });
    csv += row.join(',') + '\n';
  });
  
  fs.writeFileSync('red-cross-all-counties.csv', csv);
  console.log('📊 Saved to red-cross-all-counties.csv');
}

function analyzeCounties(features) {
  const divisions = new Set();
  const regions = new Set();
  const chapters = new Set();
  const states = new Set();
  
  const stateCounties = {};
  
  features.forEach(f => {
    const attrs = f.attributes;
    const state = attrs.STATE_ABBR || attrs.State;
    
    if (attrs.Division) divisions.add(attrs.Division);
    if (attrs.Region) regions.add(attrs.Region);
    if (attrs.Chapter) chapters.add(attrs.Chapter);
    if (state) {
      states.add(state);
      if (!stateCounties[state]) stateCounties[state] = [];
      stateCounties[state].push(attrs.COUNTY_NAME || attrs.County);
    }
  });
  
  console.log('\n📊 Complete Data Analysis:');
  console.log(`Total Counties: ${features.length}`);
  console.log(`Divisions: ${divisions.size}`);
  console.log(`Regions: ${regions.size}`);
  console.log(`Chapters: ${chapters.size}`);
  console.log(`States: ${states.size}`);
  
  // Show Nebraska and Iowa details
  if (stateCounties['NE']) {
    console.log(`\nNebraska: ${stateCounties['NE'].length} counties`);
    const neChapters = new Set(features
      .filter(f => (f.attributes.STATE_ABBR || f.attributes.State) === 'NE')
      .map(f => f.attributes.Chapter));
    console.log(`Chapters serving NE: ${Array.from(neChapters).join(', ')}`);
  }
  
  if (stateCounties['IA']) {
    console.log(`\nIowa: ${stateCounties['IA'].length} counties`);
    const iaChapters = new Set(features
      .filter(f => (f.attributes.STATE_ABBR || f.attributes.State) === 'IA')
      .map(f => f.attributes.Chapter));
    console.log(`Chapters serving IA: ${Array.from(iaChapters).join(', ')}`);
  }
  
  if (stateCounties['FL']) {
    console.log(`\nFlorida: ${stateCounties['FL'].length} counties`);
  }
}

async function tryAlternateUrl(url) {
  console.log(`\nTrying alternate URL: ${url.substring(0, 60)}...`);
  
  try {
    const countUrl = `${url}/query?where=1%3D1&returnCountOnly=true&f=json`;
    const countData = await fetchFromUrl(countUrl);
    const countJson = JSON.parse(countData);
    
    if (countJson.count) {
      console.log(`Found ${countJson.count} records at alternate URL!`);
      // Implement fetching if this works
    }
  } catch (error) {
    console.log('Alternate URL also failed:', error.message);
  }
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

// Run the fetch
fetchCountyData();