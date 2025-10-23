// Final database setup - execute the complete SQL script
const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')

const supabaseUrl = 'https://okclryedqbghlhxzqyrw.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9rY2xyeWVkcWJnaGxoeHpxeXJ3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTAzODM4MywiZXhwIjoyMDc2NjE0MzgzfQ.j5HWfl8iBxdoEm4cG4OdUE-pTaxD8lTDcPnSZzBWjxI'

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  db: {
    schema: 'public'
  }
})

async function executeSQL(sql) {
  try {
    console.log('⚡ Executing SQL...')
    const { data, error } = await supabase.rpc('exec_sql', { sql })
    
    if (error) {
      console.log('❌ SQL Error:', error.message)
      return false
    } else {
      console.log('✅ SQL executed successfully')
      return true
    }
  } catch (e) {
    console.log('❌ Exception:', e.message)
    return false
  }
}

async function finalSetup() {
  console.log('🚀 FINAL ARC Relationship Manager Database Setup')
  console.log('===============================================')
  
  try {
    // Step 1: Drop existing tables
    console.log('\n🧹 Step 1: Cleaning existing tables...')
    await executeSQL(`
      DROP TABLE IF EXISTS attachments CASCADE;
      DROP TABLE IF EXISTS meetings CASCADE;
      DROP TABLE IF EXISTS people CASCADE;
      DROP TABLE IF EXISTS organizations CASCADE;
      DROP TABLE IF EXISTS user_profiles CASCADE;
      DROP TABLE IF EXISTS activity_log CASCADE;
    `)

    // Step 2: Create organizations table
    console.log('\n🏢 Step 2: Creating organizations table...')
    await executeSQL(`
      CREATE TABLE organizations (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT NOT NULL UNIQUE,
        mission_area TEXT CHECK (mission_area IN ('disaster_relief', 'health_safety', 'military_families', 'international', 'blood_services', 'other')),
        organization_type TEXT CHECK (organization_type IN ('government', 'nonprofit', 'business', 'faith_based', 'educational', 'healthcare', 'other')),
        address TEXT,
        city TEXT,
        state TEXT,
        zip TEXT,
        website TEXT,
        phone TEXT,
        notes TEXT,
        status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'prospect')),
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW(),
        created_by UUID,
        updated_by UUID
      );
    `)

    // Step 3: Create people table
    console.log('\n👥 Step 3: Creating people table...')
    await executeSQL(`
      CREATE TABLE people (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
        first_name TEXT,
        last_name TEXT,
        title TEXT,
        email TEXT,
        phone TEXT,
        notes TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW(),
        created_by UUID,
        updated_by UUID
      );
    `)

    // Step 4: Create meetings table
    console.log('\n📅 Step 4: Creating meetings table...')
    await executeSQL(`
      CREATE TABLE meetings (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
        date DATE NOT NULL,
        location TEXT,
        summary TEXT,
        follow_up_date DATE,
        attendees UUID[],
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW(),
        created_by UUID,
        updated_by UUID
      );
    `)

    // Step 5: Create indexes
    console.log('\n🔍 Step 5: Creating indexes...')
    await executeSQL(`
      CREATE INDEX organizations_name_idx ON organizations (name);
      CREATE INDEX organizations_status_idx ON organizations (status);
      CREATE INDEX organizations_type_idx ON organizations (organization_type);
      CREATE INDEX organizations_mission_idx ON organizations (mission_area);

      CREATE INDEX people_org_idx ON people (org_id);
      CREATE INDEX people_email_idx ON people (email);
      CREATE INDEX people_name_idx ON people (first_name, last_name);

      CREATE INDEX meetings_org_idx ON meetings (org_id);
      CREATE INDEX meetings_date_idx ON meetings (date);
      CREATE INDEX meetings_follow_up_idx ON meetings (follow_up_date);
    `)

    // Step 6: Enable RLS
    console.log('\n🔒 Step 6: Enabling Row Level Security...')
    await executeSQL(`
      ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
      ALTER TABLE people ENABLE ROW LEVEL SECURITY;
      ALTER TABLE meetings ENABLE ROW LEVEL SECURITY;
    `)

    // Step 7: Create RLS policies
    console.log('\n🛡️ Step 7: Creating RLS policies...')
    await executeSQL(`
      CREATE POLICY "Enable read access for all users" ON organizations FOR SELECT USING (true);
      CREATE POLICY "Enable insert for all users" ON organizations FOR INSERT WITH CHECK (true);
      CREATE POLICY "Enable update for all users" ON organizations FOR UPDATE USING (true);
      CREATE POLICY "Enable delete for all users" ON organizations FOR DELETE USING (true);

      CREATE POLICY "Enable read access for all users" ON people FOR SELECT USING (true);
      CREATE POLICY "Enable insert for all users" ON people FOR INSERT WITH CHECK (true);
      CREATE POLICY "Enable update for all users" ON people FOR UPDATE USING (true);
      CREATE POLICY "Enable delete for all users" ON people FOR DELETE USING (true);

      CREATE POLICY "Enable read access for all users" ON meetings FOR SELECT USING (true);
      CREATE POLICY "Enable insert for all users" ON meetings FOR INSERT WITH CHECK (true);
      CREATE POLICY "Enable update for all users" ON meetings FOR UPDATE USING (true);
      CREATE POLICY "Enable delete for all users" ON meetings FOR DELETE USING (true);
    `)

    console.log('\n🎉 Database schema setup complete!')
    console.log('\n📊 Step 8: Inserting sample data via direct table operations...')

    // Insert organizations directly
    const organizations = [
      {
        name: 'FEMA Region III',
        mission_area: 'disaster_relief',
        organization_type: 'government',
        address: '615 Chestnut Street',
        city: 'Philadelphia',
        state: 'PA',
        zip: '19106',
        website: 'https://www.fema.gov/region-iii',
        phone: '(215) 931-5500',
        notes: 'Federal emergency management coordination for Mid-Atlantic region',
        status: 'active'
      },
      {
        name: 'Johns Hopkins Hospital',
        mission_area: 'health_safety',
        organization_type: 'healthcare',
        address: '1800 Orleans Street',
        city: 'Baltimore',
        state: 'MD',
        zip: '21287',
        website: 'https://www.hopkinsmedicine.org',
        phone: '(410) 955-5000',
        notes: 'Major medical center partnership for emergency response and surge capacity',
        status: 'active'
      },
      {
        name: 'Salvation Army National Capital Area',
        mission_area: 'disaster_relief',
        organization_type: 'nonprofit',
        address: '2626 Pennsylvania Avenue NW',
        city: 'Washington',
        state: 'DC',
        zip: '20037',
        website: 'https://salvationarmynca.org',
        phone: '(202) 756-2600',
        notes: 'Emergency shelter, feeding, and family services coordination',
        status: 'active'
      },
      {
        name: 'Amazon Web Services',
        mission_area: 'disaster_relief',
        organization_type: 'business',
        address: '410 Terry Avenue North',
        city: 'Seattle',
        state: 'WA',
        zip: '98109',
        website: 'https://aws.amazon.com',
        phone: '(206) 266-1000',
        notes: 'Cloud infrastructure and disaster recovery technology solutions',
        status: 'active'
      },
      {
        name: 'Washington National Cathedral',
        mission_area: 'disaster_relief',
        organization_type: 'faith_based',
        address: '3101 Wisconsin Avenue NW',
        city: 'Washington',
        state: 'DC',
        zip: '20016',
        website: 'https://cathedral.org',
        phone: '(202) 537-6200',
        notes: 'Interfaith disaster response and spiritual care coordination',
        status: 'active'
      }
    ]

    // Insert organizations
    for (const org of organizations) {
      const { data, error } = await supabase
        .from('organizations')
        .insert(org)
        .select()
      
      if (error) {
        console.log(`❌ Error inserting ${org.name}:`, error.message)
      } else {
        console.log(`✅ Inserted: ${org.name}`)
      }
    }

    // Get organization IDs for people and meetings
    const { data: orgData } = await supabase
      .from('organizations')
      .select('id, name')

    if (orgData && orgData.length > 0) {
      // Insert sample people
      const people = [
        {
          org_id: orgData[0].id,
          first_name: 'Michael',
          last_name: 'Rodriguez',
          title: 'Regional Administrator',
          email: 'michael.rodriguez@fema.dhs.gov',
          phone: '(215) 931-5501',
          notes: 'Primary FEMA contact for regional coordination and disaster response planning'
        },
        {
          org_id: orgData[1].id,
          first_name: 'Dr. Sarah',
          last_name: 'Kim',
          title: 'Emergency Department Director',
          email: 'skim@jhmi.edu',
          phone: '(410) 955-5001',
          notes: 'Emergency medical services and hospital surge capacity coordination'
        },
        {
          org_id: orgData[2].id,
          first_name: 'Major John',
          last_name: 'Williams',
          title: 'Area Commander',
          email: 'john.williams@uss.salvationarmy.org',
          phone: '(202) 756-2601',
          notes: 'Salvation Army regional operations and emergency services'
        }
      ]

      for (const person of people) {
        const { data, error } = await supabase
          .from('people')
          .insert(person)
          .select()
        
        if (error) {
          console.log(`❌ Error inserting person:`, error.message)
        } else {
          console.log(`✅ Inserted: ${person.first_name} ${person.last_name}`)
        }
      }

      // Insert sample meetings
      const meetings = [
        {
          org_id: orgData[0].id,
          date: '2024-01-15',
          location: 'ARC National Headquarters, Washington DC',
          summary: 'Quarterly coordination meeting discussing 2024 disaster preparedness initiatives and resource pre-positioning strategies.',
          follow_up_date: '2024-04-15'
        },
        {
          org_id: orgData[1].id,
          date: '2024-01-28',
          location: 'Johns Hopkins Hospital Administrative Building',
          summary: 'Medical surge planning session focused on hospital capacity during large-scale emergencies.',
          follow_up_date: '2024-03-01'
        }
      ]

      for (const meeting of meetings) {
        const { data, error } = await supabase
          .from('meetings')
          .insert(meeting)
          .select()
        
        if (error) {
          console.log(`❌ Error inserting meeting:`, error.message)
        } else {
          console.log(`✅ Inserted meeting with ${orgData.find(o => o.id === meeting.org_id)?.name}`)
        }
      }
    }

    // Final verification
    const { count: orgCount } = await supabase
      .from('organizations')
      .select('*', { count: 'exact', head: true })
    
    const { count: peopleCount } = await supabase
      .from('people')
      .select('*', { count: 'exact', head: true })
    
    const { count: meetingCount } = await supabase
      .from('meetings')
      .select('*', { count: 'exact', head: true })

    console.log('\n🎉 SETUP COMPLETE! 🎉')
    console.log('====================')
    console.log(`📊 Organizations: ${orgCount || 0}`)
    console.log(`👥 People: ${peopleCount || 0}`)
    console.log(`📅 Meetings: ${meetingCount || 0}`)
    console.log('\n🌐 Your ARC Relationship Manager is ready!')
    console.log('Visit: http://localhost:3000')

  } catch (error) {
    console.error('❌ Setup failed:', error.message)
  }
}

finalSetup()