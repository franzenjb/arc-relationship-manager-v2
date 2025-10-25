const https = require('https');
const fs = require('fs');

// New item ID you provided
const itemId = '5d30f4d5ed2246a49253248a9d0ddeb6';

async function fetchArcGISItem() {
  console.log('🔍 Fetching ArcGIS item: ' + itemId + '\n');
  
  try {
    // First, get item details
    const itemUrl = `https://arc-nhq-gis.maps.arcgis.com/sharing/rest/content/items/${itemId}?f=json`;
    console.log('Fetching item details...');
    
    const itemData = await fetchFromUrl(itemUrl);
    const itemJson = JSON.parse(itemData);
    
    console.log('Item Title:', itemJson.title);
    console.log('Item Type:', itemJson.type);
    console.log('Item URL:', itemJson.url);
    console.log('');
    
    // If it's a feature service, query it
    if (itemJson.url && itemJson.type === 'Feature Service') {
      // Try each possible layer (0, 1, 2, etc.)
      for (let layer = 0; layer <= 2; layer++) {
        const layerUrl = `${itemJson.url}/${layer}`;
        console.log(`\nChecking layer ${layer}...`);
        
        try {
          // Get layer info
          const layerInfoData = await fetchFromUrl(`${layerUrl}?f=json`);
          const layerInfo = JSON.parse(layerInfoData);
          
          if (layerInfo.name) {
            console.log(`  Layer Name: ${layerInfo.name}`);
            
            // Get record count
            const countUrl = `${layerUrl}/query?where=1%3D1&returnCountOnly=true&f=json`;
            const countData = await fetchFromUrl(countUrl);
            const countJson = JSON.parse(countData);
            
            console.log(`  Record Count: ${countJson.count}`);
            
            // If this looks like county data (3,162 records), fetch it
            if (countJson.count > 3000 && countJson.count < 3500) {
              console.log('\n🎯 This looks like the COUNTY data! Fetching all records...\n');
              await fetchAllRecords(layerUrl, countJson.count);
              return;
            }
          }
        } catch (err) {
          console.log(`  Layer ${layer} not accessible`);
        }
      }
    } else if (itemJson.url) {
      // It might be a direct feature layer
      console.log('Trying as direct feature layer...');
      const countUrl = `${itemJson.url}/query?where=1%3D1&returnCountOnly=true&f=json`;
      
      try {
        const countData = await fetchFromUrl(countUrl);
        const countJson = JSON.parse(countData);
        console.log(`Record Count: ${countJson.count}`);
        
        if (countJson.count > 3000) {
          console.log('\n🎯 Found county data! Fetching...\n');
          await fetchAllRecords(itemJson.url, countJson.count);
        }
      } catch (err) {
        console.log('Could not query as feature layer');
      }
    }
    
    // If CSV or Excel, try to download directly
    if (itemJson.type === 'CSV' || itemJson.type === 'Microsoft Excel') {
      console.log('\nThis is a data file. Attempting download...');
      const dataUrl = `https://arc-nhq-gis.maps.arcgis.com/sharing/rest/content/items/${itemId}/data`;
      
      try {
        const fileData = await fetchFromUrl(dataUrl);
        const fileName = itemJson.type === 'CSV' ? 'counties.csv' : 'counties.xlsx';
        fs.writeFileSync(fileName, fileData);
        console.log(`✅ Downloaded to ${fileName}`);
      } catch (err) {
        console.log('Could not download data file:', err.message);
      }
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
  
  console.log(`\n✅ Fetched ${allFeatures.length} records!`);
  
  // Save to JSON
  fs.writeFileSync('red-cross-counties-final.json', JSON.stringify({ features: allFeatures }, null, 2));
  console.log('💾 Saved to red-cross-counties-final.json');
  
  // Create CSV
  if (allFeatures.length > 0) {
    const attrs = allFeatures[0].attributes;
    const headers = Object.keys(attrs).filter(k => !k.startsWith('Shape'));
    
    let csv = headers.join(',') + '\n';
    allFeatures.forEach(feature => {
      const row = headers.map(h => {
        let value = feature.attributes[h] || '';
        value = String(value).replace(/"/g, '""');
        return value.includes(',') ? `"${value}"` : value;
      });
      csv += row.join(',') + '\n';
    });
    
    fs.writeFileSync('red-cross-counties-final.csv', csv);
    console.log('📊 Saved to red-cross-counties-final.csv');
    
    // Show sample
    console.log('\nSample records:');
    for (let i = 0; i < Math.min(5, allFeatures.length); i++) {
      const attrs = allFeatures[i].attributes;
      console.log(`${i + 1}. ${attrs.COUNTY_NAME || attrs.County || attrs.NAME}, ${attrs.STATE_ABBR || attrs.State || attrs.STATE}`);
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
fetchArcGISItem();