const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://yqucprgxgdnowjnzrtoz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlxdWNwcmd4Z2Rub3dqbnpydG96Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEyMjQ5NzcsImV4cCI6MjA3NjgwMDk3N30.gvm88pvDBvr4L2ovapL0eZlQN7h6FU5wKH2Mkn-L8rM';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkStates() {
  console.log('Checking organization states in database...\n');
  
  const { data, error } = await supabase
    .from('organizations')
    .select('state, name, city')
    .order('state');
    
  if (error) {
    console.error('Error:', error);
    return;
  }
  
  // Group by state
  const stateGroups = {};
  data.forEach(org => {
    const state = org.state || 'NO STATE';
    if (!stateGroups[state]) {
      stateGroups[state] = [];
    }
    stateGroups[state].push(org);
  });
  
  // Display results
  Object.keys(stateGroups).sort().forEach(state => {
    console.log(`${state}: ${stateGroups[state].length} organizations`);
    stateGroups[state].slice(0, 3).forEach(org => {
      console.log(`  - ${org.name} (${org.city || 'no city'})`);
    });
    if (stateGroups[state].length > 3) {
      console.log(`  ... and ${stateGroups[state].length - 3} more`);
    }
  });
  
  console.log('\n📊 Summary:');
  console.log(`Total organizations: ${data.length}`);
  console.log(`States with data: ${Object.keys(stateGroups).join(', ')}`);
  
  // Check if we need to add test data for other regions
  if (!stateGroups['NE'] && !stateGroups['IA']) {
    console.log('\n⚠️  No Nebraska or Iowa organizations found!');
    console.log('Need to add test data for Nebraska/Iowa region.');
  }
}

checkStates();