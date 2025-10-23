const { createClient } = require('@supabase/supabase-js');

// Direct database connection with service role key
const supabaseUrl = 'https://yqucprgxgdnowjnzrtoz.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlxdWNwcmd4Z2Rub3dqbnpydG96Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTIyNDk3NywiZXhwIjoyMDc2ODAwOTc3fQ.HOhYjXMZhOyB9W-gHHoHYQx1gRQTh5ue2qM0K-aKcxs';

async function runMigration() {
  console.log('🚀 Applying SQL migration to fix missing columns...\n');

  // We need to use fetch to directly call the Supabase REST API
  const migrations = [
    {
      name: 'other_organizations',
      sql: "ALTER TABLE meetings ADD COLUMN IF NOT EXISTS other_organizations UUID[] DEFAULT '{}'",
      comment: "Array of organization IDs that attended the meeting"
    },
    {
      name: 'summary',
      sql: "ALTER TABLE meetings ADD COLUMN IF NOT EXISTS summary TEXT",
      comment: "Brief summary of meeting content and outcomes"
    },
    {
      name: 'rc_attendees',
      sql: "ALTER TABLE meetings ADD COLUMN IF NOT EXISTS rc_attendees UUID[] DEFAULT '{}'",
      comment: "Array of Red Cross staff member IDs who attended"
    },
    {
      name: 'attendees', 
      sql: "ALTER TABLE meetings ADD COLUMN IF NOT EXISTS attendees UUID[] DEFAULT '{}'",
      comment: "Array of external person IDs who attended"
    },
    {
      name: 'lead_organization_id',
      sql: "ALTER TABLE meetings ADD COLUMN IF NOT EXISTS lead_organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL",
      comment: "Primary organization hosting/leading the meeting"
    },
    {
      name: 'primary_external_poc_id',
      sql: "ALTER TABLE meetings ADD COLUMN IF NOT EXISTS primary_external_poc_id UUID REFERENCES people(id) ON DELETE SET NULL",
      comment: "Primary external point of contact for the meeting"
    },
    {
      name: 'county_id',
      sql: "ALTER TABLE meetings ADD COLUMN IF NOT EXISTS county_id UUID",
      comment: "County where the meeting took place"
    },
    {
      name: 'next_meeting_date',
      sql: "ALTER TABLE meetings ADD COLUMN IF NOT EXISTS next_meeting_date DATE",
      comment: "Date of the next scheduled meeting"
    },
    {
      name: 'agenda',
      sql: "ALTER TABLE meetings ADD COLUMN IF NOT EXISTS agenda TEXT",
      comment: "Meeting agenda or topics to be discussed"
    }
  ];

  // Execute each migration
  for (const migration of migrations) {
    try {
      console.log(`📝 Adding column: ${migration.name}`);
      
      // Use Supabase REST API to execute SQL
      const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': supabaseServiceKey,
          'Authorization': `Bearer ${supabaseServiceKey}`
        },
        body: JSON.stringify({
          query: migration.sql
        })
      });

      if (!response.ok) {
        // Try alternative approach - direct database query
        console.log(`   ⚠️  RPC method not available, trying direct approach...`);
        
        // We'll use a workaround by checking if we can select the column
        const testResponse = await fetch(`${supabaseUrl}/rest/v1/meetings?select=${migration.name}&limit=1`, {
          headers: {
            'apikey': supabaseServiceKey,
            'Authorization': `Bearer ${supabaseServiceKey}`
          }
        });

        if (testResponse.status === 400) {
          console.log(`   ❌ Column ${migration.name} does not exist and cannot be added via API`);
          console.log(`   📋 SQL to run manually: ${migration.sql}`);
        } else {
          console.log(`   ✅ Column ${migration.name} already exists`);
        }
      } else {
        console.log(`   ✅ Column ${migration.name} added successfully`);
      }
    } catch (error) {
      console.error(`   ❌ Error with ${migration.name}:`, error.message);
    }
  }

  console.log('\n🔍 Verifying current table structure...\n');

  // Check what columns exist
  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  const { data, error } = await supabase
    .from('meetings')
    .select('*')
    .limit(1);

  if (!error && data) {
    const columns = data.length > 0 ? Object.keys(data[0]) : [];
    console.log('✅ Current meetings table columns:');
    columns.forEach(col => console.log(`   - ${col}`));
    
    // Check for missing columns
    const requiredColumns = migrations.map(m => m.name);
    const missingColumns = requiredColumns.filter(col => !columns.includes(col));
    
    if (missingColumns.length > 0) {
      console.log('\n⚠️  Missing columns that need to be added:');
      missingColumns.forEach(col => console.log(`   - ${col}`));
      
      console.log('\n📋 COMPLETE SQL TO RUN IN SUPABASE SQL EDITOR:');
      console.log('================================================\n');
      migrations.filter(m => missingColumns.includes(m.name)).forEach(m => {
        console.log(m.sql + ';');
      });
      console.log('\n================================================');
    } else {
      console.log('\n✅ All required columns exist!');
    }
  } else if (error) {
    console.error('❌ Error checking table structure:', error.message);
  }
}

runMigration();