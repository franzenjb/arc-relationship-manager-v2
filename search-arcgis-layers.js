const https = require('https');

// Search for all layers in the Red Cross organization
async function searchRedCrossLayers() {
  console.log('🔍 Searching for all Red Cross layers...\n');
  
  // Search the organization's content
  const searchUrl = 'https://arc-nhq-gis.maps.arcgis.com/sharing/rest/search?q=owner:ARC_Jeff.Franzen_825009+OR+orgid:arc-nhq-gis&f=json&num=100';
  
  try {
    const results = await fetchFromUrl(searchUrl);
    const data = JSON.parse(results);
    
    console.log(`Found ${data.total} items in the organization\n`);
    
    // Look for county-related items
    const countyItems = data.results.filter(item => {
      const title = item.title.toLowerCase();
      const desc = (item.description || '').toLowerCase();
      const snippet = (item.snippet || '').toLowerCase();
      
      return title.includes('county') || 
             title.includes('counties') ||
             title.includes('geo') ||
             title.includes('geography') ||
             desc.includes('county') ||
             snippet.includes('3162') ||
             snippet.includes('3,162');
    });
    
    console.log('📍 County-related items found:\n');
    countyItems.forEach(item => {
      console.log(`Title: ${item.title}`);
      console.log(`ID: ${item.id}`);
      console.log(`Type: ${item.type}`);
      console.log(`URL: ${item.url}`);
      console.log(`Description: ${item.description || 'No description'}`);
      console.log('---\n');
    });
    
    // Try to find feature services
    const featureServices = data.results.filter(item => 
      item.type === 'Feature Service' || 
      item.type === 'Feature Layer' ||
      item.type === 'CSV' ||
      item.type === 'Microsoft Excel'
    );
    
    console.log('🗺️ All Feature Services and Data Files:\n');
    featureServices.forEach(item => {
      console.log(`${item.title} (${item.type})`);
      console.log(`  ID: ${item.id}`);
      if (item.url) console.log(`  URL: ${item.url}`);
      console.log('');
    });
    
  } catch (error) {
    console.error('Error searching:', error.message);
  }
}

// Alternative: Search public ArcGIS for Red Cross county data
async function searchPublicArcGIS() {
  console.log('\n🌐 Searching public ArcGIS Online...\n');
  
  const queries = [
    'Red Cross counties 3162',
    'Master RC Geo County',
    'Red Cross geography county',
    'ARC county boundaries'
  ];
  
  for (const query of queries) {
    const searchUrl = `https://www.arcgis.com/sharing/rest/search?q=${encodeURIComponent(query)}&f=json&num=10`;
    
    try {
      const results = await fetchFromUrl(searchUrl);
      const data = JSON.parse(results);
      
      if (data.results && data.results.length > 0) {
        console.log(`\nResults for "${query}":`);
        data.results.forEach(item => {
          if (item.numViews > 100) { // Popular items
            console.log(`  - ${item.title} (${item.type})`);
            console.log(`    Owner: ${item.owner}`);
            console.log(`    Views: ${item.numViews}`);
            if (item.url) console.log(`    URL: ${item.url}`);
          }
        });
      }
    } catch (error) {
      console.log(`Error searching for "${query}":`, error.message);
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

// Run both searches
async function main() {
  await searchRedCrossLayers();
  await searchPublicArcGIS();
}

main();