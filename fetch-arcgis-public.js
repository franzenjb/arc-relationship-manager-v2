const https = require('https');
const fs = require('fs');

// Try to find and fetch the public layer
async function findAndFetchLayer() {
  console.log('🔍 Searching for Red Cross County layer...\n');
  
  // Possible service URLs based on the item ID
  const possibleUrls = [
    // Try the item ID as a hosted feature layer
    'https://services.arcgis.com/P3ePLMYs2RVChkJx/arcgis/rest/services/Master_RC_Geo_County_2025/FeatureServer/0',
    'https://services9.arcgis.com/q5uyFfTZo3LFL04P/arcgis/rest/services/Master_RC_Geo_County_2025/FeatureServer/0',
    'https://services.arcgis.com/pGfbNJoYypmNq86F/arcgis/rest/services/Master_RC_Geo_County_2025/FeatureServer/0',
    // Try with different naming conventions
    'https://arc-nhq-gis.maps.arcgis.com/sharing/rest/content/items/f3f38f8e35884d23950e1842faa861d0/data',
  ];
  
  // First, let's try to get item info
  const itemUrl = 'https://arc-nhq-gis.maps.arcgis.com/sharing/rest/content/items/f3f38f8e35884d23950e1842faa861d0?f=json';
  
  console.log('Getting item metadata...');
  try {
    const itemData = await fetchFromUrl(itemUrl);
    const itemJson = JSON.parse(itemData);
    console.log('Item Title:', itemJson.title);
    console.log('Item Type:', itemJson.type);
    console.log('Item URL:', itemJson.url);
    
    if (itemJson.url) {
      console.log('\n✅ Found service URL:', itemJson.url);
      
      // Try to query the service
      await queryService(itemJson.url);
    }
  } catch (error) {
    console.log('Could not get item metadata:', error.message);
  }
  
  // Try known patterns
  console.log('\nTrying common service patterns...');
  for (const url of possibleUrls) {
    console.log(`\nTrying: ${url.substring(0, 60)}...`);
    const success = await queryService(url);
    if (success) break;
  }
}

async function queryService(baseUrl) {
  try {
    // Ensure it's a FeatureServer URL
    let serviceUrl = baseUrl;
    if (!baseUrl.includes('/FeatureServer/')) {
      if (baseUrl.includes('/MapServer/')) {
        serviceUrl = baseUrl.replace('/MapServer/', '/FeatureServer/');
      } else {
        serviceUrl = baseUrl + '/0';
      }
    }
    
    // First get the count
    const countUrl = `${serviceUrl}/query?where=1%3D1&returnCountOnly=true&f=json`;
    console.log('Getting count...');
    
    const countData = await fetchFromUrl(countUrl);
    const countJson = JSON.parse(countData);
    
    if (countJson.count) {
      console.log(`Found ${countJson.count} records!`);
      
      // Get fields info
      const fieldsUrl = `${serviceUrl}?f=json`;
      const fieldsData = await fetchFromUrl(fieldsUrl);
      const fieldsJson = JSON.parse(fieldsData);
      
      if (fieldsJson.fields) {
        console.log('\nAvailable fields:');
        const relevantFields = fieldsJson.fields
          .filter(f => !['OBJECTID', 'GlobalID', 'Shape__Area', 'Shape__Length'].includes(f.name))
          .map(f => f.name);
        console.log(relevantFields.join(', '));
      }
      
      // Fetch sample data
      console.log('\nFetching sample data...');
      const sampleUrl = `${serviceUrl}/query?where=1%3D1&outFields=*&f=json&resultRecordCount=5`;
      const sampleData = await fetchFromUrl(sampleUrl);
      const sampleJson = JSON.parse(sampleData);
      
      if (sampleJson.features && sampleJson.features.length > 0) {
        console.log('\nSample records:');
        sampleJson.features.forEach((f, i) => {
          console.log(`\nRecord ${i + 1}:`);
          console.log(JSON.stringify(f.attributes, null, 2));
        });
        
        // If this looks good, fetch all data
        if (countJson.count <= 5000) {
          console.log(`\nFetching all ${countJson.count} records...`);
          await fetchAllRecords(serviceUrl, countJson.count);
        } else {
          console.log('\nDataset too large for single fetch. Would need batching.');
          await fetchAllRecords(serviceUrl, countJson.count);
        }
        
        return true;
      }
    }
  } catch (error) {
    console.log('Error:', error.message);
  }
  return false;
}

async function fetchAllRecords(serviceUrl, totalCount) {
  const allFeatures = [];
  const batchSize = 1000;
  const batches = Math.ceil(totalCount / batchSize);
  
  for (let i = 0; i < batches; i++) {
    const offset = i * batchSize;
    const queryUrl = `${serviceUrl}/query?where=1%3D1&outFields=*&f=json&resultOffset=${offset}&resultRecordCount=${batchSize}`;
    
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
  
  console.log(`\n✅ Fetched ${allFeatures.length} total records!`);
  
  // Save to file
  fs.writeFileSync('red-cross-counties-complete.json', JSON.stringify({ features: allFeatures }, null, 2));
  console.log('💾 Data saved to red-cross-counties-complete.json');
  
  // Create CSV
  if (allFeatures.length > 0) {
    createCSV(allFeatures);
  }
  
  // Analyze the data
  analyzeCountyData(allFeatures);
}

function createCSV(features) {
  if (features.length === 0) return;
  
  // Get all unique field names
  const fields = new Set();
  features.forEach(f => {
    Object.keys(f.attributes).forEach(key => fields.add(key));
  });
  
  const fieldArray = Array.from(fields);
  
  // Create CSV content
  let csv = fieldArray.join(',') + '\n';
  
  features.forEach(feature => {
    const row = fieldArray.map(field => {
      const value = feature.attributes[field];
      // Escape commas and quotes in values
      if (value === null || value === undefined) return '';
      const strValue = String(value);
      if (strValue.includes(',') || strValue.includes('"')) {
        return '"' + strValue.replace(/"/g, '""') + '"';
      }
      return strValue;
    });
    csv += row.join(',') + '\n';
  });
  
  fs.writeFileSync('red-cross-counties.csv', csv);
  console.log('📊 CSV saved to red-cross-counties.csv');
}

function analyzeCountyData(features) {
  const divisions = new Set();
  const regions = new Set();
  const chapters = new Set();
  const states = new Set();
  
  features.forEach(f => {
    const attrs = f.attributes;
    if (attrs.Division) divisions.add(attrs.Division);
    if (attrs.Region) regions.add(attrs.Region);
    if (attrs.Chapter) chapters.add(attrs.Chapter);
    if (attrs.STATE_NAME || attrs.STATE_ABBR || attrs.State) {
      states.add(attrs.STATE_NAME || attrs.STATE_ABBR || attrs.State);
    }
  });
  
  console.log('\n📊 Data Summary:');
  console.log(`Total Counties: ${features.length}`);
  console.log(`Divisions: ${divisions.size}`);
  console.log(`Regions: ${regions.size}`);
  console.log(`Chapters: ${chapters.size}`);
  console.log(`States: ${states.size}`);
  
  if (divisions.size > 0) {
    console.log('\nDivisions found:');
    Array.from(divisions).sort().forEach(d => console.log(`  - ${d}`));
  }
  
  // Find Nebraska and Iowa specifically
  const nebraskaCounties = features.filter(f => {
    const attrs = f.attributes;
    return attrs.STATE_NAME === 'Nebraska' || attrs.STATE_ABBR === 'NE' || attrs.State === 'NE';
  });
  
  const iowaCounties = features.filter(f => {
    const attrs = f.attributes;
    return attrs.STATE_NAME === 'Iowa' || attrs.STATE_ABBR === 'IA' || attrs.State === 'IA';
  });
  
  if (nebraskaCounties.length > 0) {
    console.log(`\nNebraska: ${nebraskaCounties.length} counties`);
    const neChapters = new Set(nebraskaCounties.map(f => f.attributes.Chapter));
    console.log(`Chapters: ${Array.from(neChapters).join(', ')}`);
  }
  
  if (iowaCounties.length > 0) {
    console.log(`\nIowa: ${iowaCounties.length} counties`);
    const iaChapters = new Set(iowaCounties.map(f => f.attributes.Chapter));
    console.log(`Chapters: ${Array.from(iaChapters).join(', ')}`);
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

// Run the script
findAndFetchLayer();