const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://yqucprgxgdnowjnzrtoz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlxdWNwcmd4Z2Rub3dqbnpydG96Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEyMjQ5NzcsImV4cCI6MjA3NjgwMDk3N30.gvm88pvDBvr4L2ovapL0eZlQN7h6FU5wKH2Mkn-L8rM';

const supabase = createClient(supabaseUrl, supabaseKey);

// Nebraska Organizations
const nebraskaOrgs = [
  {
    name: 'Omaha Emergency Management',
    description: 'City of Omaha emergency response coordination center',
    website: 'https://www.omaha-emergency.gov',
    address: '1819 Farnam Street',
    city: 'Omaha',
    state: 'NE',
    zip: '68102',
    phone: '(402) 444-5000',
    mission_area: 'disaster_relief',
    organization_type: 'government',
    status: 'active',
    notes: 'Key partner for Omaha area disaster response'
  },
  {
    name: 'Lincoln Community Foundation',
    description: 'Supporting nonprofits and community initiatives in Lancaster County',
    website: 'https://www.lcf.org',
    address: '215 Centennial Mall South',
    city: 'Lincoln',
    state: 'NE',
    zip: '68508',
    phone: '(402) 474-2345',
    mission_area: 'other',
    organization_type: 'nonprofit',
    status: 'active',
    notes: 'Potential funding partner for community programs'
  },
  {
    name: 'Nebraska Hospital Association',
    description: 'Representing hospitals and health systems across Nebraska',
    website: 'https://www.nhanet.org',
    address: '3255 Salt Creek Circle',
    city: 'Lincoln',
    state: 'NE',
    zip: '68504',
    phone: '(402) 742-8140',
    mission_area: 'health_safety',
    organization_type: 'healthcare',
    status: 'active',
    notes: 'Critical partner for mass casualty events'
  },
  {
    name: 'Bellevue Fire Department',
    description: 'Fire and rescue services for Bellevue and Sarpy County',
    website: 'https://www.bellevue.net/fire',
    address: '1510 West Mission Avenue',
    city: 'Bellevue',
    state: 'NE',
    zip: '68005',
    phone: '(402) 293-3040',
    mission_area: 'disaster_relief',
    organization_type: 'government',
    status: 'active',
    notes: 'Strong mutual aid partnership'
  }
];

// Iowa Organizations
const iowaOrgs = [
  {
    name: 'Iowa Department of Homeland Security',
    description: 'State emergency management and homeland security coordination',
    website: 'https://www.homelandsecurity.iowa.gov',
    address: '7900 Hickman Road',
    city: 'Des Moines',
    state: 'IA',
    zip: '50322',
    phone: '(515) 725-3231',
    mission_area: 'disaster_relief',
    organization_type: 'government',
    status: 'active',
    notes: 'Primary state emergency management partner'
  },
  {
    name: 'Cedar Rapids Community School District',
    description: 'Second largest school district in Iowa',
    website: 'https://www.crschools.us',
    address: '2500 Edgewood Road NW',
    city: 'Cedar Rapids',
    state: 'IA',
    zip: '52405',
    phone: '(319) 558-2000',
    mission_area: 'other',
    organization_type: 'educational',
    status: 'active',
    notes: 'Partner for youth preparedness programs'
  },
  {
    name: 'UnityPoint Health - Iowa Methodist',
    description: 'Major healthcare provider in central Iowa',
    website: 'https://www.unitypoint.org',
    address: '1200 Pleasant Street',
    city: 'Des Moines',
    state: 'IA',
    zip: '50309',
    phone: '(515) 241-6212',
    mission_area: 'health_safety',
    organization_type: 'healthcare',
    status: 'active',
    notes: 'Blood drive host and medical response partner'
  },
  {
    name: 'Council Bluffs Emergency Services',
    description: 'Emergency management for Council Bluffs',
    website: 'https://www.councilbluffs-ia.gov',
    address: '209 Pearl Street',
    city: 'Council Bluffs',
    state: 'IA',
    zip: '51503',
    phone: '(712) 328-4650',
    mission_area: 'disaster_relief',
    organization_type: 'government',
    status: 'active',
    notes: 'Key partner for Missouri River flooding response'
  },
  {
    name: 'Waterloo Community Foundation',
    description: 'Building community through philanthropy',
    website: 'https://www.cfneia.org',
    address: '3117 Greenhill Circle',
    city: 'Waterloo',
    state: 'IA',
    zip: '50701',
    phone: '(319) 287-9106',
    mission_area: 'other',
    organization_type: 'nonprofit',
    status: 'active',
    notes: 'Grant funding partner for local programs'
  }
];

async function createTestData() {
  console.log('🚀 Creating Nebraska and Iowa test organizations...\n');
  
  let successCount = 0;
  let errorCount = 0;
  
  // Create Nebraska organizations
  console.log('Creating Nebraska organizations...');
  for (const org of nebraskaOrgs) {
    const { data, error } = await supabase
      .from('organizations')
      .insert([{
        ...org,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select();
      
    if (error) {
      console.error(`❌ Error creating ${org.name}:`, error.message);
      errorCount++;
    } else {
      console.log(`✅ Created: ${org.name} (${org.city}, ${org.state})`);
      successCount++;
    }
  }
  
  console.log('\nCreating Iowa organizations...');
  for (const org of iowaOrgs) {
    const { data, error } = await supabase
      .from('organizations')
      .insert([{
        ...org,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select();
      
    if (error) {
      console.error(`❌ Error creating ${org.name}:`, error.message);
      errorCount++;
    } else {
      console.log(`✅ Created: ${org.name} (${org.city}, ${org.state})`);
      successCount++;
    }
  }
  
  console.log('\n📊 Summary:');
  console.log(`✅ Successfully created: ${successCount} organizations`);
  console.log(`❌ Failed to create: ${errorCount} organizations`);
  console.log(`Nebraska: ${nebraskaOrgs.length} organizations`);
  console.log(`Iowa: ${iowaOrgs.length} organizations`);
  
  if (successCount > 0) {
    console.log('\n🎉 Test data creation complete!');
    console.log('\n📝 Next steps to test region filtering:');
    console.log('1. Login as Florida - should see only FL organizations');
    console.log('2. Login as Nebraska/Iowa - should see only NE/IA organizations');
    console.log('3. Login as National HQ - should see ALL organizations');
  }
}

createTestData();