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
    mission_area: 'disaster_response',
    organization_type: 'government',
    status: 'active',
    tags: ['emergency', 'disaster', 'government'],
    relationship_manager: 'Midwest Regional Lead',
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
    // email: 'info@lcf.org',
    mission_area: 'community_services',
    organization_type: 'nonprofit',
    status: 'active',
    tags: ['foundation', 'grants', 'community'],
    relationship_manager: 'Nebraska Chapter Lead',
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
    // email: 'info@nhanet.org',
    mission_area: 'health_safety',
    organization_type: 'healthcare',
    status: 'active',
    tags: ['healthcare', 'hospitals', 'medical'],
    relationship_manager: 'Health Services Coordinator',
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
    // email: 'fire@bellevue.net',
    mission_area: 'disaster_response',
    organization_type: 'government',
    status: 'active',
    tags: ['fire', 'rescue', 'ems'],
    relationship_manager: 'Sarpy County Liaison',
    notes: 'Strong mutual aid partnership'
  },
  {
    name: 'Grand Island Food Bank',
    description: 'Fighting hunger in central Nebraska communities',
    website: 'https://www.gifoodbank.org',
    address: '522 West First Street',
    city: 'Grand Island',
    state: 'NE',
    zip: '68801',
    phone: '(308) 385-6282',
    // email: 'info@gifoodbank.org',
    mission_area: 'community_services',
    organization_type: 'nonprofit',
    status: 'active',
    tags: ['food', 'hunger', 'nutrition'],
    relationship_manager: 'Central Nebraska Coordinator',
    notes: 'Partner for disaster feeding operations'
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
    // email: 'info@iowa.gov',
    mission_area: 'disaster_response',
    organization_type: 'government',
    status: 'active',
    tags: ['emergency', 'state', 'homeland security'],
    relationship_manager: 'Iowa State Liaison',
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
    // email: 'info@crschools.us',
    mission_area: 'youth_preparedness',
    organization_type: 'education',
    status: 'active',
    tags: ['schools', 'education', 'youth'],
    relationship_manager: 'Youth Services Lead',
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
    // email: 'info@unitypoint.org',
    mission_area: 'health_safety',
    organization_type: 'healthcare',
    status: 'active',
    tags: ['hospital', 'medical', 'healthcare'],
    relationship_manager: 'Healthcare Partnership Lead',
    notes: 'Blood drive host and medical response partner'
  },
  {
    name: 'Davenport Fire Department',
    description: 'Fire, rescue, and emergency medical services for Davenport',
    website: 'https://www.davenportiowa.com/fire',
    address: '1801 E 46th Street',
    city: 'Davenport',
    state: 'IA',
    zip: '52807',
    phone: '(563) 326-7701',
    // email: 'fire@davenportiowa.com',
    mission_area: 'disaster_response',
    organization_type: 'government',
    status: 'active',
    tags: ['fire', 'rescue', 'ems'],
    relationship_manager: 'Quad Cities Coordinator',
    notes: 'Quad Cities mutual aid partner'
  },
  {
    name: 'Iowa City Crisis Center',
    description: 'Crisis intervention and suicide prevention services',
    website: 'https://www.jccrisiscenter.org',
    address: '1121 Gilbert Court',
    city: 'Iowa City',
    state: 'IA',
    zip: '52240',
    phone: '(319) 351-0140',
    // email: 'info@jccrisiscenter.org',
    mission_area: 'health_safety',
    organization_type: 'nonprofit',
    status: 'active',
    tags: ['crisis', 'mental health', 'support'],
    relationship_manager: 'Mental Health Partnership Lead',
    notes: 'Partner for disaster mental health services'
  },
  {
    name: 'Waterloo Community Foundation',
    description: 'Building community through philanthropy in Black Hawk County',
    website: 'https://www.cfneia.org',
    address: '3117 Greenhill Circle',
    city: 'Waterloo',
    state: 'IA',
    zip: '50701',
    phone: '(319) 287-9106',
    // email: 'info@cfneia.org',
    mission_area: 'community_services',
    organization_type: 'nonprofit',
    status: 'active',
    tags: ['foundation', 'grants', 'community'],
    relationship_manager: 'Black Hawk County Lead',
    notes: 'Grant funding partner for local programs'
  },
  {
    name: 'Council Bluffs Emergency Services',
    description: 'Emergency management for Council Bluffs and Pottawattamie County',
    website: 'https://www.councilbluffs-ia.gov',
    address: '209 Pearl Street',
    city: 'Council Bluffs',
    state: 'IA',
    zip: '51503',
    phone: '(712) 328-4650',
    // email: 'emergency@councilbluffs-ia.gov',
    mission_area: 'disaster_response',
    organization_type: 'government',
    status: 'active',
    tags: ['emergency', 'government', 'disaster'],
    relationship_manager: 'Western Iowa Coordinator',
    notes: 'Key partner for Missouri River flooding response'
  }
];

async function createTestData() {
  console.log('🚀 Creating Nebraska and Iowa test organizations...\n');
  
  // Create Nebraska organizations
  console.log('Creating Nebraska organizations...');
  for (const org of nebraskaOrgs) {
    const { data, error } = await supabase
      .from('organizations')
      .insert([{
        ...org,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        created_by: 'System',
        updated_by: 'System'
      }])
      .select();
      
    if (error) {
      console.error(`Error creating ${org.name}:`, error.message);
    } else {
      console.log(`✅ Created: ${org.name} (${org.city}, ${org.state})`);
    }
  }
  
  console.log('\nCreating Iowa organizations...');
  for (const org of iowaOrgs) {
    const { data, error } = await supabase
      .from('organizations')
      .insert([{
        ...org,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        created_by: 'System',
        updated_by: 'System'
      }])
      .select();
      
    if (error) {
      console.error(`Error creating ${org.name}:`, error.message);
    } else {
      console.log(`✅ Created: ${org.name} (${org.city}, ${org.state})`);
    }
  }
  
  console.log('\n📊 Summary:');
  console.log(`Created ${nebraskaOrgs.length} Nebraska organizations`);
  console.log(`Created ${iowaOrgs.length} Iowa organizations`);
  console.log('\nTest data creation complete! You can now test region filtering.');
}

createTestData();