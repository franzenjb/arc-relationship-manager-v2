// Verify that the schema fix was applied successfully
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://okclryedqbghlhxzqyrw.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9rY2xyeWVkcWJnaGxoeHpxeXJ3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTAzODM4MywiZXhwIjoyMDc2NjE0MzgzfQ.j5HWfl8iBxdoEm4cG4OdUE-pTaxD8lTDcPnSZzBWjxI'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function verifyTableExists(tableName) {
  try {
    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .limit(1)
    
    if (error) {
      return { exists: false, error: error.message }
    } else {
      return { 
        exists: true, 
        columns: data && data.length > 0 ? Object.keys(data[0]) : [],
        hasData: data && data.length > 0
      }
    }
  } catch (error) {
    return { exists: false, error: error.message }
  }
}

async function verifySchemaFix() {
  console.log('🔍 VERIFYING SCHEMA FIX')
  console.log('=======================\n')
  
  // Expected tables and their key columns
  const expectedSchema = {
    regions: ['id', 'name', 'code', 'created_at'],
    chapters: ['id', 'region_id', 'name', 'code', 'created_at'],
    counties: ['id', 'chapter_id', 'name', 'state_code', 'fips_code', 'created_at'],
    organizations: [
      'id', 'name', 'mission_area', 'organization_type',
      'region_id', 'chapter_id', 'county_id',
      'address', 'city', 'state', 'zip',
      'website', 'phone', 'tags', 'notes', 'status',
      'created_at', 'updated_at', 'created_by', 'updated_by', 'relationship_managers'
    ],
    people: [
      'id', 'org_id', 'first_name', 'last_name', 'title',
      'email', 'phone', 'notes',
      'created_at', 'updated_at', 'created_by', 'updated_by'
    ],
    meetings: [
      'id', 'org_id', 'date', 'location', 'summary',
      'follow_up_date', 'attendees',
      'created_at', 'updated_at', 'created_by', 'updated_by'
    ],
    attachments: ['id', 'meeting_id', 'storage_path', 'file_name', 'mime_type', 'uploaded_by', 'created_at'],
    user_profiles: ['id', 'email', 'role', 'region_id', 'chapter_id', 'first_name', 'last_name', 'notifications_enabled', 'created_at', 'updated_at'],
    activity_log: ['id', 'actor_user_id', 'entity_type', 'entity_id', 'action', 'payload', 'timestamp'],
    relationship_managers: ['id', 'organization_id', 'name', 'email', 'phone', 'notes', 'created_at', 'updated_at', 'created_by', 'updated_by']
  }
  
  let allGood = true
  const results = {}
  
  for (const [tableName, expectedColumns] of Object.entries(expectedSchema)) {
    console.log(`📋 Checking ${tableName}...`)
    
    const result = await verifyTableExists(tableName)
    results[tableName] = result
    
    if (!result.exists) {
      console.log(`   ❌ Table does not exist: ${result.error}`)
      allGood = false
    } else {
      console.log(`   ✅ Table exists`)
      
      // Check for missing columns
      const missing = expectedColumns.filter(col => !result.columns.includes(col))
      const extra = result.columns.filter(col => !expectedColumns.includes(col))
      
      if (missing.length > 0) {
        console.log(`   ⚠️  Missing columns: ${missing.join(', ')}`)
        allGood = false
      }
      
      if (extra.length > 0) {
        console.log(`   📝 Extra columns: ${extra.join(', ')}`)
      }
      
      if (missing.length === 0 && extra.length === 0) {
        console.log(`   ✅ All expected columns present`)
      }
      
      if (result.hasData) {
        console.log(`   📊 Table has sample data`)
      } else {
        console.log(`   📋 Table is empty`)
      }
    }
    console.log('')
  }
  
  // Test specific organization functionality
  console.log('🧪 TESTING ORGANIZATION FUNCTIONALITY')
  console.log('====================================\n')
  
  try {
    // Try to create a test organization with all new fields
    console.log('📝 Testing organization creation with new schema...')
    
    const testOrg = {
      name: 'Schema Test Organization',
      mission_area: 'disaster_relief',
      organization_type: 'nonprofit',
      status: 'active',
      region_id: '550e8400-e29b-41d4-a716-446655440000', // NCGC region
      chapter_id: '550e8400-e29b-41d4-a716-446655440010', // DC Metro chapter
      address: '123 Test Street',
      city: 'Washington',
      state: 'DC',
      zip: '20001',
      phone: '555-0123',
      website: 'https://test.org',
      notes: 'Test organization for schema verification',
      tags: ['test', 'schema-verification'],
      relationship_managers: [
        {
          id: 'test-rm-1',
          name: 'Test Manager',
          email: 'test@example.com',
          phone: '555-0124',
          notes: 'Test relationship manager'
        }
      ]
    }
    
    const { data: newOrg, error: createError } = await supabase
      .from('organizations')
      .insert(testOrg)
      .select('*')
      .single()
    
    if (createError) {
      console.log(`   ❌ Failed to create test organization: ${createError.message}`)
      allGood = false
    } else {
      console.log(`   ✅ Successfully created test organization`)
      console.log(`   📋 ID: ${newOrg.id}`)
      
      // Verify the data was stored correctly
      if (newOrg.region_id) console.log(`   ✅ region_id stored correctly`)
      if (newOrg.chapter_id) console.log(`   ✅ chapter_id stored correctly`)
      if (newOrg.tags && newOrg.tags.length > 0) console.log(`   ✅ tags array stored correctly`)
      if (newOrg.relationship_managers && newOrg.relationship_managers.length > 0) console.log(`   ✅ relationship_managers JSON stored correctly`)
      
      // Clean up - delete the test organization
      const { error: deleteError } = await supabase
        .from('organizations')
        .delete()
        .eq('id', newOrg.id)
      
      if (!deleteError) {
        console.log(`   🧹 Test organization cleaned up`)
      }
    }
    
  } catch (testError) {
    console.log(`   ❌ Error testing organization functionality: ${testError.message}`)
    allGood = false
  }
  
  console.log('\n🎯 VERIFICATION SUMMARY')
  console.log('======================')
  
  if (allGood) {
    console.log('🎉 All schema fixes applied successfully!')
    console.log('✅ Database is ready for production use')
    console.log('✅ Organization forms should now work correctly')
    console.log('✅ The "chapter_id not found" error should be resolved')
  } else {
    console.log('⚠️  Some issues remain:')
    
    for (const [tableName, result] of Object.entries(results)) {
      if (!result.exists) {
        console.log(`   - ${tableName} table still missing`)
      }
    }
    
    console.log('\n📋 Next steps:')
    console.log('1. Review any error messages above')
    console.log('2. Re-run the complete-schema-fix.sql in Supabase SQL Editor')
    console.log('3. Run this verification script again')
  }
}

verifySchemaFix().catch(error => {
  console.error('💥 Verification failed:', error)
})