const fs = require('fs');

// Load the county data
const data = JSON.parse(fs.readFileSync('red-cross-3162-counties.json', 'utf8'));

console.log('🎯 RED CROSS GEOGRAPHIC HIERARCHY ANALYSIS\n');
console.log(`Total Counties: ${data.features.length}\n`);

// Analyze hierarchy
const divisions = {};
const regions = {};
const chapters = {};
const states = {};

data.features.forEach(feature => {
  const attrs = feature.attributes;
  
  // Division level
  if (!divisions[attrs.Division]) {
    divisions[attrs.Division] = {
      name: attrs.Division,
      code: attrs.DCODE,
      regions: new Set(),
      states: new Set(),
      counties: 0
    };
  }
  divisions[attrs.Division].regions.add(attrs.Region);
  divisions[attrs.Division].states.add(attrs.State);
  divisions[attrs.Division].counties++;
  
  // Region level
  if (!regions[attrs.Region]) {
    regions[attrs.Region] = {
      name: attrs.Region,
      code: attrs.RCODE,
      division: attrs.Division,
      chapters: new Set(),
      states: new Set(),
      counties: 0
    };
  }
  regions[attrs.Region].chapters.add(attrs.Chapter);
  regions[attrs.Region].states.add(attrs.State);
  regions[attrs.Region].counties++;
  
  // Chapter level
  if (!chapters[attrs.Chapter]) {
    chapters[attrs.Chapter] = {
      name: attrs.Chapter,
      code: attrs.ECODE,
      region: attrs.Region,
      division: attrs.Division,
      states: new Set(),
      counties: []
    };
  }
  chapters[attrs.Chapter].states.add(attrs.State);
  chapters[attrs.Chapter].counties.push(`${attrs.County}, ${attrs.State}`);
  
  // State level
  if (!states[attrs.State]) {
    states[attrs.State] = {
      name: attrs.County_ST_Long,
      abbr: attrs.State,
      chapters: new Set(),
      counties: []
    };
  }
  states[attrs.State].chapters.add(attrs.Chapter);
  states[attrs.State].counties.push(attrs.County);
});

// Print Division hierarchy
console.log('DIVISIONS (Top Level):');
console.log('======================');
Object.values(divisions).sort((a,b) => a.name.localeCompare(b.name)).forEach(div => {
  console.log(`\n${div.name} (${div.code})`);
  console.log(`  Regions: ${div.regions.size}`);
  console.log(`  States: ${div.states.size}`);
  console.log(`  Counties: ${div.counties}`);
});

// Print specific regions we care about
console.log('\n\nKEY REGIONS FOR OUR IMPLEMENTATION:');
console.log('====================================');

// Florida regions
console.log('\nFLORIDA:');
const floridaRegions = Object.values(regions).filter(r => r.states.has('FL'));
floridaRegions.forEach(region => {
  console.log(`  ${region.name} (${region.code})`);
  console.log(`    Chapters: ${region.chapters.size}`);
  console.log(`    Counties: ${region.counties}`);
});

// Nebraska regions
console.log('\nNEBRASKA:');
const nebraskaRegions = Object.values(regions).filter(r => r.states.has('NE'));
nebraskaRegions.forEach(region => {
  console.log(`  ${region.name} (${region.code})`);
  console.log(`    Chapters: ${region.chapters.size}`);
  console.log(`    Counties: ${region.counties}`);
});

// Iowa regions
console.log('\nIOWA:');
const iowaRegions = Object.values(regions).filter(r => r.states.has('IA'));
iowaRegions.forEach(region => {
  console.log(`  ${region.name} (${region.code})`);
  console.log(`    Chapters: ${region.chapters.size}`);
  console.log(`    Counties: ${region.counties}`);
});

// Show Nebraska and Iowa chapters
console.log('\n\nNEBRASKA & IOWA CHAPTERS:');
console.log('=========================');
const neChapters = Object.values(chapters).filter(c => c.states.has('NE'));
const iaChapters = Object.values(chapters).filter(c => c.states.has('IA'));

console.log('\nNebraska Chapters:');
neChapters.forEach(chapter => {
  console.log(`  ${chapter.name} (${chapter.code})`);
  console.log(`    Counties: ${chapter.counties.filter(c => c.includes('NE')).length}`);
});

console.log('\nIowa Chapters:');
iaChapters.forEach(chapter => {
  console.log(`  ${chapter.name} (${chapter.code})`);
  console.log(`    Counties: ${chapter.counties.filter(c => c.includes('IA')).length}`);
});

// Statistics
console.log('\n\nOVERALL STATISTICS:');
console.log('==================');
console.log(`Total Divisions: ${Object.keys(divisions).length}`);
console.log(`Total Regions: ${Object.keys(regions).length}`);
console.log(`Total Chapters: ${Object.keys(chapters).length}`);
console.log(`Total States/Territories: ${Object.keys(states).length}`);
console.log(`Total Counties: ${data.features.length}`);

// Save complete hierarchy
const hierarchy = {
  divisions: Object.values(divisions).map(d => ({
    name: d.name,
    code: d.code,
    regions: Array.from(d.regions),
    states: Array.from(d.states),
    counties: d.counties
  })),
  regions: Object.values(regions).map(r => ({
    name: r.name,
    code: r.code,
    division: r.division,
    chapters: Array.from(r.chapters),
    states: Array.from(r.states),
    counties: r.counties
  })),
  chapters: Object.values(chapters).map(c => ({
    name: c.name,
    code: c.code,
    region: c.region,
    division: c.division,
    states: Array.from(c.states),
    counties: c.counties
  })),
  states: Object.entries(states).map(([abbr, s]) => ({
    name: s.name,
    abbr: s.abbr,
    chapters: Array.from(s.chapters),
    countyCount: s.counties.length
  }))
};

fs.writeFileSync('red-cross-complete-hierarchy.json', JSON.stringify(hierarchy, null, 2));
console.log('\n💾 Complete hierarchy saved to red-cross-complete-hierarchy.json');