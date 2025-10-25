const https = require('https');
const fs = require('fs');

// The service URL from the item
const serviceUrl = 'https://services.arcgis.com/pGfbNJoYypmNq86F/arcgis/rest/services/Master_ARC_Geography_2022/FeatureServer';

async function checkAllLayers() {
  console.log('🔍 Checking all layers in the service...\n');
  
  try {
    // Get service info
    const serviceData = await fetchFromUrl(`${serviceUrl}?f=json`);
    const serviceJson = JSON.parse(serviceData);
    
    console.log('Service Name:', serviceJson.serviceDescription || 'Master ARC Geography 2022');
    console.log('Layers:', serviceJson.layers ? serviceJson.layers.length : 0);
    console.log('');
    
    if (serviceJson.layers) {
      for (const layer of serviceJson.layers) {
        console.log(`Layer ${layer.id}: ${layer.name}`);
        
        // Check record count for each layer
        try {
          const countUrl = `${serviceUrl}/${layer.id}/query?where=1%3D1&returnCountOnly=true&f=json`;
          const countData = await fetchFromUrl(countUrl);
          const countJson = JSON.parse(countData);
          
          console.log(`  Records: ${countJson.count}`);
          
          // If this has ~3,162 records, it's our county layer!
          if (countJson.count > 3100 && countJson.count < 3200) {
            console.log('  🎯 THIS IS THE COUNTY LAYER!');
            console.log('\nFetching all county records from this layer...\n');
            await fetchCountyLayer(`${serviceUrl}/${layer.id}`, countJson.count);
            return;
          }
        } catch (err) {
          console.log(`  Could not query: ${err.message}`);
        }
        console.log('');
      }
    }
    
    // Also check tables
    if (serviceJson.tables) {
      console.log('\nTables found:');
      for (const table of serviceJson.tables) {
        console.log(`Table ${table.id}: ${table.name}`);
      }
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

async function fetchCountyLayer(layerUrl, totalCount) {
  // Get field info
  const fieldsData = await fetchFromUrl(`${layerUrl}?f=json`);
  const fieldsJson = JSON.parse(fieldsData);
  
  console.log('Layer Name:', fieldsJson.name);
  console.log('Record Count:', totalCount);
  console.log('\nFields:');
  
  if (fieldsJson.fields) {
    fieldsJson.fields.forEach(field => {
      if (!field.name.startsWith('Shape') && !['OBJECTID', 'GlobalID'].includes(field.name)) {
        console.log(`  - ${field.name}`);
      }
    });
  }
  
  // Fetch all records
  const allFeatures = [];
  const batchSize = 1000;
  const batches = Math.ceil(totalCount / batchSize);
  
  console.log('\nFetching data...');
  
  for (let i = 0; i < batches; i++) {
    const offset = i * batchSize;
    const queryUrl = `${layerUrl}/query?where=1%3D1&outFields=*&f=json&resultOffset=${offset}&resultRecordCount=${batchSize}`;
    
    console.log(`Batch ${i + 1}/${batches}...`);
    
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
  
  console.log(`\n✅ Fetched ${allFeatures.length} county records!`);
  
  // Save the data
  fs.writeFileSync('red-cross-3162-counties.json', JSON.stringify({ features: allFeatures }, null, 2));
  console.log('💾 Saved to red-cross-3162-counties.json');
  
  // Create CSV
  if (allFeatures.length > 0) {
    const attrs = allFeatures[0].attributes;
    const headers = Object.keys(attrs).filter(k => 
      !k.startsWith('Shape') && !['OBJECTID', 'GlobalID'].includes(k)
    );
    
    let csv = headers.join(',') + '\n';
    allFeatures.forEach(feature => {
      const row = headers.map(h => {
        let value = feature.attributes[h] || '';
        value = String(value).replace(/"/g, '""');
        return value.includes(',') ? `"${value}"` : value;
      });
      csv += row.join(',') + '\n';
    });
    
    fs.writeFileSync('red-cross-3162-counties.csv', csv);
    console.log('📊 Saved to red-cross-3162-counties.csv');
    
    // Show sample
    console.log('\nSample counties:');
    for (let i = 0; i < 5; i++) {
      const attrs = allFeatures[i].attributes;
      console.log(`${i + 1}. ${attrs.COUNTY || attrs.County || attrs.COUNTY_NAME}, ${attrs.STATE || attrs.State || attrs.STATE_ABBR}`);
    }
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

// Run it
checkAllLayers();