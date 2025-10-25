const https = require('https');
const fs = require('fs');

// The new item ID you just provided
const itemId = '6ac7ff999d374d429cc2172efeceacd9';

async function fetchCountiesData() {
  console.log('🎯 Fetching ArcGIS item: ' + itemId + '\n');
  
  try {
    // Get item details
    const itemUrl = `https://arc-nhq-gis.maps.arcgis.com/sharing/rest/content/items/${itemId}?f=json`;
    console.log('Getting item details...');
    
    const itemData = await fetchFromUrl(itemUrl);
    const itemJson = JSON.parse(itemData);
    
    console.log('Title:', itemJson.title);
    console.log('Type:', itemJson.type);
    console.log('Description:', itemJson.description || 'No description');
    console.log('');
    
    // If it's a feature service, query it
    if (itemJson.url) {
      console.log('Service URL:', itemJson.url);
      
      // Try to get record count
      const countUrl = `${itemJson.url}/0/query?where=1%3D1&returnCountOnly=true&f=json`;
      console.log('\nChecking record count...');
      
      const countData = await fetchFromUrl(countUrl);
      const countJson = JSON.parse(countData);
      
      console.log(`Found ${countJson.count} records`);
      
      if (countJson.count > 3000 && countJson.count < 3500) {
        console.log('\n✅ This is the COUNTY data! Fetching all records...\n');
        
        // Get field info first
        const fieldsUrl = `${itemJson.url}/0?f=json`;
        const fieldsData = await fetchFromUrl(fieldsUrl);
        const fieldsJson = JSON.parse(fieldsData);
        
        if (fieldsJson.fields) {
          console.log('Available fields:');
          fieldsJson.fields.forEach(field => {
            if (!field.name.startsWith('Shape') && field.name !== 'OBJECTID' && field.name !== 'GlobalID') {
              console.log(`  - ${field.name}`);
            }
          });
          console.log('');
        }
        
        // Fetch all records
        await fetchAllRecords(`${itemJson.url}/0`, countJson.count);
      }
    } else if (itemJson.type === 'CSV' || itemJson.type === 'Microsoft Excel') {
      // Try to download as data file
      console.log('This is a data file. Downloading...');
      const dataUrl = `https://arc-nhq-gis.maps.arcgis.com/sharing/rest/content/items/${itemId}/data`;
      
      const fileData = await fetchFromUrl(dataUrl);
      const fileName = itemJson.type === 'CSV' ? 'counties.csv' : 'counties.xlsx';
      fs.writeFileSync(fileName, fileData);
      console.log(`✅ Downloaded to ${fileName}`);
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

async function fetchAllRecords(serviceUrl, totalCount) {
  const allFeatures = [];
  const batchSize = 1000;
  const batches = Math.ceil(totalCount / batchSize);
  
  for (let i = 0; i < batches; i++) {
    const offset = i * batchSize;
    const queryUrl = `${serviceUrl}/query?where=1%3D1&outFields=*&f=json&resultOffset=${offset}&resultRecordCount=${batchSize}`;
    
    console.log(`Fetching batch ${i + 1}/${batches}...`);
    
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
  const outputData = {
    itemId: itemId,
    recordCount: allFeatures.length,
    features: allFeatures
  };
  
  fs.writeFileSync('red-cross-counties-complete.json', JSON.stringify(outputData, null, 2));
  console.log('💾 Saved to red-cross-counties-complete.json');
  
  // Create CSV with all important fields
  if (allFeatures.length > 0) {
    const attrs = allFeatures[0].attributes;
    const headers = Object.keys(attrs).filter(k => 
      !k.startsWith('Shape') && 
      !['OBJECTID', 'GlobalID', 'created_user', 'created_date', 'last_edited_user', 'last_edited_date'].includes(k)
    );
    
    let csv = headers.join(',') + '\n';
    allFeatures.forEach(feature => {
      const row = headers.map(h => {
        let value = feature.attributes[h] || '';
        value = String(value).replace(/"/g, '""');
        return value.includes(',') || value.includes('\n') ? `"${value}"` : value;
      });
      csv += row.join(',') + '\n';
    });
    
    fs.writeFileSync('red-cross-counties-complete.csv', csv);
    console.log('📊 Saved to red-cross-counties-complete.csv');
    
    // Analyze the data
    analyzeCountyData(allFeatures);
  }
}

function analyzeCountyData(features) {
  console.log('\n📊 Complete Data Analysis:');
  console.log(`Total Records: ${features.length}`);
  
  // Get unique values for key fields
  const divisions = new Set();
  const regions = new Set();
  const chapters = new Set();
  const states = new Set();
  const stateCounties = {};
  
  features.forEach(f => {
    const attrs = f.attributes;
    
    // Try different field names
    const division = attrs.Division || attrs.DIVISION || attrs.division_name;
    const region = attrs.Region || attrs.REGION || attrs.region_name;
    const chapter = attrs.Chapter || attrs.CHAPTER || attrs.chapter_name;
    const state = attrs.STATE_ABBR || attrs.State || attrs.STATE || attrs.state_abbr;
    const county = attrs.COUNTY_NAME || attrs.County || attrs.COUNTY || attrs.county_name;
    
    if (division) divisions.add(division);
    if (region) regions.add(region);
    if (chapter) chapters.add(chapter);
    if (state) {
      states.add(state);
      if (!stateCounties[state]) stateCounties[state] = [];
      if (county) stateCounties[state].push(county);
    }
  });
  
  console.log(`Unique Divisions: ${divisions.size}`);
  if (divisions.size > 0) {
    console.log('  Divisions:', Array.from(divisions).slice(0, 5).join(', '), divisions.size > 5 ? '...' : '');
  }
  
  console.log(`Unique Regions: ${regions.size}`);
  if (regions.size > 0 && regions.size < 20) {
    console.log('  Sample Regions:', Array.from(regions).slice(0, 10).join(', '));
  }
  
  console.log(`Unique Chapters: ${chapters.size}`);
  console.log(`States Covered: ${states.size}`);
  
  // Show sample records
  console.log('\nSample Records:');
  for (let i = 0; i < Math.min(5, features.length); i++) {
    const attrs = features[i].attributes;
    const county = attrs.COUNTY_NAME || attrs.County || attrs.COUNTY || attrs.county_name || 'Unknown';
    const state = attrs.STATE_ABBR || attrs.State || attrs.STATE || attrs.state_abbr || 'Unknown';
    const chapter = attrs.Chapter || attrs.CHAPTER || attrs.chapter_name || 'Unknown';
    
    console.log(`${i + 1}. ${county}, ${state} - Chapter: ${chapter}`);
  }
  
  // Check specific states
  if (stateCounties['NE']) {
    console.log(`\nNebraska: ${stateCounties['NE'].length} counties`);
  }
  if (stateCounties['IA']) {
    console.log(`Iowa: ${stateCounties['IA'].length} counties`);
  }
  if (stateCounties['FL']) {
    console.log(`Florida: ${stateCounties['FL'].length} counties`);
  }
  
  console.log('\n🎯 Data extraction complete!');
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

// Run it
fetchCountiesData();