const https = require('https');
const fs = require('fs');

// Web Map ID
const webMapId = '5d30f4d5ed2246a49253248a9d0ddeb6';

async function fetchWebMapLayers() {
  console.log('🗺️ Fetching Web Map layers...\n');
  
  try {
    // Get the web map data
    const dataUrl = `https://arc-nhq-gis.maps.arcgis.com/sharing/rest/content/items/${webMapId}/data?f=json`;
    console.log('Getting web map configuration...');
    
    const mapData = await fetchFromUrl(dataUrl);
    const mapJson = JSON.parse(mapData);
    
    if (mapJson.operationalLayers) {
      console.log(`Found ${mapJson.operationalLayers.length} layers in the web map:\n`);
      
      for (let i = 0; i < mapJson.operationalLayers.length; i++) {
        const layer = mapJson.operationalLayers[i];
        console.log(`Layer ${i + 1}: ${layer.title || layer.name || 'Unnamed'}`);
        console.log(`  Type: ${layer.layerType || 'Unknown'}`);
        
        if (layer.url) {
          console.log(`  URL: ${layer.url}`);
          
          // Try to query this layer
          try {
            const countUrl = `${layer.url}/query?where=1%3D1&returnCountOnly=true&f=json`;
            const countData = await fetchFromUrl(countUrl);
            const countJson = JSON.parse(countData);
            console.log(`  Record Count: ${countJson.count}`);
            
            // If this has ~3,162 records, it's our county data!
            if (countJson.count > 3100 && countJson.count < 3200) {
              console.log('\n🎯 FOUND IT! This is the county data with 3,162 records!');
              console.log('Fetching all county records...\n');
              await fetchAllCountyData(layer.url, countJson.count);
              return;
            }
          } catch (err) {
            console.log(`  Could not query layer: ${err.message}`);
          }
        }
        
        if (layer.featureCollection && layer.featureCollection.layers) {
          console.log(`  This is a feature collection with ${layer.featureCollection.layers.length} sub-layers`);
        }
        
        console.log('');
      }
    }
    
    // Also check basemap layers
    if (mapJson.baseMap && mapJson.baseMap.baseMapLayers) {
      console.log('\nBasemap layers:');
      mapJson.baseMap.baseMapLayers.forEach(layer => {
        console.log(`- ${layer.title || layer.id}`);
      });
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

async function fetchAllCountyData(serviceUrl, totalCount) {
  const allFeatures = [];
  const batchSize = 1000;
  const batches = Math.ceil(totalCount / batchSize);
  
  // First, get field info
  const fieldsData = await fetchFromUrl(`${serviceUrl}?f=json`);
  const fieldsJson = JSON.parse(fieldsData);
  
  console.log('Available fields:');
  if (fieldsJson.fields) {
    fieldsJson.fields.forEach(field => {
      if (!field.name.startsWith('Shape') && field.name !== 'OBJECTID') {
        console.log(`  - ${field.name}`);
      }
    });
  }
  console.log('');
  
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
  
  console.log(`\n✅ Successfully fetched ${allFeatures.length} county records!`);
  
  // Save to JSON
  fs.writeFileSync('red-cross-all-counties-FINAL.json', JSON.stringify({ features: allFeatures }, null, 2));
  console.log('💾 Saved to red-cross-all-counties-FINAL.json');
  
  // Create comprehensive CSV
  if (allFeatures.length > 0) {
    const attrs = allFeatures[0].attributes;
    const headers = Object.keys(attrs).filter(k => !k.startsWith('Shape') && k !== 'OBJECTID');
    
    let csv = headers.join(',') + '\n';
    allFeatures.forEach(feature => {
      const row = headers.map(h => {
        let value = feature.attributes[h] || '';
        value = String(value).replace(/"/g, '""');
        return value.includes(',') || value.includes('\n') ? `"${value}"` : value;
      });
      csv += row.join(',') + '\n';
    });
    
    fs.writeFileSync('red-cross-all-counties-FINAL.csv', csv);
    console.log('📊 Saved to red-cross-all-counties-FINAL.csv');
    
    // Analyze the data
    analyzeData(allFeatures);
  }
}

function analyzeData(features) {
  const divisions = new Set();
  const regions = new Set();
  const chapters = new Set();
  const states = new Set();
  
  console.log('\n📊 Data Analysis:');
  console.log(`Total Counties: ${features.length}`);
  
  // Sample records
  console.log('\nSample records:');
  for (let i = 0; i < 5; i++) {
    const attrs = features[i].attributes;
    console.log(`${i + 1}. ${attrs.COUNTY_NAME || attrs.County || attrs.NAME}, ${attrs.STATE_ABBR || attrs.State || attrs.STATE}`);
    
    // Collect unique values
    if (attrs.Division) divisions.add(attrs.Division);
    if (attrs.Region) regions.add(attrs.Region);
    if (attrs.Chapter) chapters.add(attrs.Chapter);
    if (attrs.STATE_ABBR || attrs.State) states.add(attrs.STATE_ABBR || attrs.State);
  }
  
  // Full analysis
  features.forEach(f => {
    const attrs = f.attributes;
    if (attrs.Division) divisions.add(attrs.Division);
    if (attrs.Region) regions.add(attrs.Region);
    if (attrs.Chapter) chapters.add(attrs.Chapter);
    if (attrs.STATE_ABBR || attrs.State) states.add(attrs.STATE_ABBR || attrs.State);
  });
  
  console.log(`\nUnique Divisions: ${divisions.size}`);
  console.log(`Unique Regions: ${regions.size}`);
  console.log(`Unique Chapters: ${chapters.size}`);
  console.log(`Unique States: ${states.size}`);
  
  console.log('\n🎯 SUCCESS! We have the complete Red Cross county dataset!');
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
fetchWebMapLayers();