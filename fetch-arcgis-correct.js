const https = require('https');
const fs = require('fs');

// Correct ArcGIS Feature Service URL
const featureServiceUrl = 'https://services.arcgis.com/pGfbNJoYypmNq86F/arcgis/rest/services/Master_ARC_Geography_2022/FeatureServer/0';

async function fetchArcGISData() {
  console.log('🗺️ Fetching Red Cross Geographic Data from ArcGIS...\n');
  
  // First get count
  const countUrl = `${featureServiceUrl}/query?where=1%3D1&returnCountOnly=true&f=json`;
  console.log('Getting record count...');
  
  try {
    const countData = await fetchFromUrl(countUrl);
    const countJson = JSON.parse(countData);
    const totalCount = countJson.count;
    console.log(`Total records: ${totalCount}\n`);
    
    // Fetch in batches (ArcGIS has limits)
    const batchSize = 1000;
    const batches = Math.ceil(totalCount / batchSize);
    let allFeatures = [];
    
    for (let i = 0; i < batches; i++) {
      const offset = i * batchSize;
      const queryUrl = `${featureServiceUrl}/query?where=1%3D1&outFields=*&f=json&resultOffset=${offset}&resultRecordCount=${batchSize}`;
      
      console.log(`Fetching batch ${i + 1}/${batches} (records ${offset + 1}-${Math.min(offset + batchSize, totalCount)})...`);
      
      const batchData = await fetchFromUrl(queryUrl);
      const batchJson = JSON.parse(batchData);
      
      if (batchJson.features) {
        allFeatures = allFeatures.concat(batchJson.features);
      }
    }
    
    console.log(`\n✅ Fetched ${allFeatures.length} total records!`);
    
    // Save raw data
    const fullData = { features: allFeatures };
    fs.writeFileSync('red-cross-counties-raw.json', JSON.stringify(fullData, null, 2));
    console.log('💾 Raw data saved to red-cross-counties-raw.json');
    
    // Create analysis
    analyzeData(allFeatures);
    
    // Create simplified structure
    createSimplifiedStructure(allFeatures);
    
  } catch (error) {
    console.error('Error:', error.message);
    
    // Try alternate approach - just get first 100 records to see structure
    console.log('\nTrying to get sample data...');
    const sampleUrl = `${featureServiceUrl}/query?where=1%3D1&outFields=*&f=json&resultRecordCount=10`;
    
    try {
      const sampleData = await fetchFromUrl(sampleUrl);
      const sampleJson = JSON.parse(sampleData);
      
      if (sampleJson.features && sampleJson.features.length > 0) {
        console.log('\n📝 Sample record structure:');
        console.log(JSON.stringify(sampleJson.features[0].attributes, null, 2));
        
        fs.writeFileSync('red-cross-sample.json', JSON.stringify(sampleJson, null, 2));
        console.log('\n💾 Sample data saved to red-cross-sample.json');
      }
    } catch (sampleError) {
      console.error('Could not fetch sample:', sampleError.message);
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

function analyzeData(features) {
  const divisions = new Set();
  const regions = new Set();
  const chapters = new Set();
  const states = new Set();
  
  // Track Nebraska and Iowa specifically
  const nebraskaCounties = [];
  const iowaCounties = [];
  const floridaCounties = [];
  
  features.forEach(feature => {
    const attrs = feature.attributes;
    
    // Collect unique values
    if (attrs.Division) divisions.add(attrs.Division);
    if (attrs.Region) regions.add(attrs.Region);
    if (attrs.Chapter) chapters.add(attrs.Chapter);
    if (attrs.STATE_ABBR) states.add(attrs.STATE_ABBR);
    
    // Track our specific states
    if (attrs.STATE_ABBR === 'NE') {
      nebraskaCounties.push({
        county: attrs.COUNTY_NAME,
        chapter: attrs.Chapter,
        region: attrs.Region,
        division: attrs.Division
      });
    } else if (attrs.STATE_ABBR === 'IA') {
      iowaCounties.push({
        county: attrs.COUNTY_NAME,
        chapter: attrs.Chapter,
        region: attrs.Region,
        division: attrs.Division
      });
    } else if (attrs.STATE_ABBR === 'FL') {
      floridaCounties.push({
        county: attrs.COUNTY_NAME,
        chapter: attrs.Chapter,
        region: attrs.Region,
        division: attrs.Division
      });
    }
  });
  
  console.log('\n📊 Data Analysis:');
  console.log(`   Total Counties: ${features.length}`);
  console.log(`   Divisions: ${divisions.size}`);
  console.log(`   Regions: ${regions.size}`);
  console.log(`   Chapters: ${chapters.size}`);
  console.log(`   States: ${states.size}`);
  
  console.log('\n🌽 Nebraska Data:');
  console.log(`   Counties: ${nebraskaCounties.length}`);
  if (nebraskaCounties.length > 0) {
    const neChapters = new Set(nebraskaCounties.map(c => c.chapter));
    const neRegions = new Set(nebraskaCounties.map(c => c.region));
    console.log(`   Chapters: ${Array.from(neChapters).join(', ')}`);
    console.log(`   Regions: ${Array.from(neRegions).join(', ')}`);
  }
  
  console.log('\n🌾 Iowa Data:');
  console.log(`   Counties: ${iowaCounties.length}`);
  if (iowaCounties.length > 0) {
    const iaChapters = new Set(iowaCounties.map(c => c.chapter));
    const iaRegions = new Set(iowaCounties.map(c => c.region));
    console.log(`   Chapters: ${Array.from(iaChapters).join(', ')}`);
    console.log(`   Regions: ${Array.from(iaRegions).join(', ')}`);
  }
  
  console.log('\n🏖️ Florida Data:');
  console.log(`   Counties: ${floridaCounties.length}`);
  if (floridaCounties.length > 0) {
    const flChapters = new Set(floridaCounties.map(c => c.chapter));
    const flRegions = new Set(floridaCounties.map(c => c.region));
    console.log(`   Chapters (first 5): ${Array.from(flChapters).slice(0, 5).join(', ')}...`);
    console.log(`   Regions: ${Array.from(flRegions).join(', ')}`);
  }
  
  console.log('\n📍 All Divisions:');
  Array.from(divisions).sort().forEach(d => console.log(`   - ${d}`));
}

function createSimplifiedStructure(features) {
  const structure = {
    divisions: {},
    totalCounties: features.length,
    generated: new Date().toISOString()
  };
  
  // Organize by division -> region -> chapter -> counties
  features.forEach(feature => {
    const attrs = feature.attributes;
    const division = attrs.Division || 'Unknown';
    const region = attrs.Region || 'Unknown';
    const chapter = attrs.Chapter || 'Unknown';
    const county = attrs.COUNTY_NAME;
    const stateAbbr = attrs.STATE_ABBR;
    
    // Initialize structures
    if (!structure.divisions[division]) {
      structure.divisions[division] = {
        name: division,
        regions: {},
        states: new Set()
      };
    }
    
    structure.divisions[division].states.add(stateAbbr);
    
    if (!structure.divisions[division].regions[region]) {
      structure.divisions[division].regions[region] = {
        name: region,
        chapters: {},
        states: new Set()
      };
    }
    
    structure.divisions[division].regions[region].states.add(stateAbbr);
    
    if (!structure.divisions[division].regions[region].chapters[chapter]) {
      structure.divisions[division].regions[region].chapters[chapter] = {
        name: chapter,
        counties: [],
        states: new Set()
      };
    }
    
    structure.divisions[division].regions[region].chapters[chapter].states.add(stateAbbr);
    
    // Add county
    structure.divisions[division].regions[region].chapters[chapter].counties.push({
      name: county,
      state: stateAbbr,
      fips: attrs.FIPS
    });
  });
  
  // Convert Sets to Arrays
  Object.values(structure.divisions).forEach(div => {
    div.states = Array.from(div.states);
    Object.values(div.regions).forEach(reg => {
      reg.states = Array.from(reg.states);
      Object.values(reg.chapters).forEach(chap => {
        chap.states = Array.from(chap.states);
      });
    });
  });
  
  // Save simplified structure
  fs.writeFileSync('red-cross-hierarchy.json', JSON.stringify(structure, null, 2));
  console.log('\n📁 Simplified hierarchy saved to red-cross-hierarchy.json');
}

fetchArcGISData();