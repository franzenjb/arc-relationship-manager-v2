// Apply column fixes that can be done via Supabase client
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://okclryedqbghlhxzqyrw.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9rY2xyeWVkcWJnaGxoeHpxeXJ3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTAzODM4MywiZXhwIjoyMDc2NjE0MzgzfQ.j5HWfl8iBxdoEm4cG4OdUE-pTaxD8lTDcPnSZzBWjxI'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function testCurrentSchema() {
  console.log('🧪 TESTING CURRENT ORGANIZATION SCHEMA')
  console.log('=====================================\n')
  
  try {
    // Test a simple organization insert with problematic fields
    const testData = {
      name: 'Test Organization',
      status: 'active',
      // These fields might cause the error:
      region_id: '550e8400-e29b-41d4-a716-446655440000',
      chapter_id: '550e8400-e29b-41d4-a716-446655440010'
    }
    
    console.log('📝 Attempting to insert organization with region_id and chapter_id...')
    
    const { data, error } = await supabase
      .from('organizations')
      .insert(testData)
      .select('*')
      .single()
    
    if (error) {
      console.log(`❌ Error (this confirms the problem): ${error.message}`)
      
      // Try without the problematic fields
      console.log('\n📝 Trying without region_id and chapter_id...')
      
      const simpleTest = {
        name: 'Test Organization Simple',
        status: 'active'
      }
      
      const { data: simpleData, error: simpleError } = await supabase
        .from('organizations')
        .insert(simpleTest)
        .select('*')
        .single()
      
      if (simpleError) {
        console.log(`❌ Still error: ${simpleError.message}`)
      } else {
        console.log(`✅ Simple insert works`)
        console.log(`📋 Available columns: ${Object.keys(simpleData).join(', ')}`)
        
        // Clean up
        await supabase.from('organizations').delete().eq('id', simpleData.id)
        console.log(`🧹 Cleaned up test data`)
      }
      
    } else {
      console.log(`✅ Insert successful (schema already fixed!)`)
      console.log(`📋 Available columns: ${Object.keys(data).join(', ')}`)
      
      // Clean up
      await supabase.from('organizations').delete().eq('id', data.id)
      console.log(`🧹 Cleaned up test data`)
    }
    
  } catch (error) {
    console.log(`💥 Exception: ${error.message}`)
  }
}

async function checkTableExistence() {
  console.log('\n🔍 CHECKING TABLE EXISTENCE')
  console.log('===========================\n')
  
  const tables = [
    'regions', 'chapters', 'counties', 'organizations', 
    'people', 'meetings', 'attachments', 'user_profiles', 
    'activity_log', 'relationship_managers'
  ]
  
  for (const table of tables) {
    try {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .limit(1)
      
      if (error) {
        console.log(`❌ ${table}: ${error.message}`)
      } else {
        console.log(`✅ ${table}: exists`)
        if (data && data.length > 0) {
          console.log(`   📊 Sample columns: ${Object.keys(data[0]).slice(0, 5).join(', ')}${Object.keys(data[0]).length > 5 ? '...' : ''}`)
        }
      }
    } catch (err) {
      console.log(`💥 ${table}: ${err.message}`)
    }
  }
}

async function testOrganizationQueries() {
  console.log('\n🧪 TESTING ORGANIZATION QUERIES')
  console.log('===============================\n')
  
  try {
    // Test basic select
    console.log('📋 Testing basic organization select...')
    const { data: orgs, error: selectError } = await supabase
      .from('organizations')
      .select('*')
      .limit(5)
    
    if (selectError) {
      console.log(`❌ Select error: ${selectError.message}`)
    } else {
      console.log(`✅ Select works, found ${orgs.length} organizations`)
      if (orgs.length > 0) {
        console.log(`📋 Available columns: ${Object.keys(orgs[0]).join(', ')}`)
      }
    }
    
    // Test with specific columns that might be missing
    console.log('\n📋 Testing select with potentially missing columns...')
    const { data: specificOrgs, error: specificError } = await supabase
      .from('organizations')
      .select('id, name, region_id, chapter_id, relationship_managers')
      .limit(5)
    
    if (specificError) {
      console.log(`❌ Specific column select error: ${specificError.message}`)
      console.log(`   This confirms missing columns`)
    } else {
      console.log(`✅ All requested columns exist`)
    }
    
  } catch (error) {
    console.log(`💥 Query test exception: ${error.message}`)
  }
}

async function runDiagnostics() {
  console.log('🩺 RUNNING SCHEMA DIAGNOSTICS')
  console.log('============================')
  
  await testCurrentSchema()
  await checkTableExistence()
  await testOrganizationQueries()
  
  console.log('\n📋 NEXT STEPS:')
  console.log('1. If errors above mention missing columns/tables, apply the SQL fix')
  console.log('2. Copy database/complete-schema-fix.sql into Supabase SQL Editor')
  console.log('3. Run the SQL to create missing tables and columns')
  console.log('4. Run: node verify-schema-fix.js to confirm fixes')
  console.log('5. Test the organization form to ensure it works')
}

runDiagnostics().catch(error => {
  console.error('💥 Diagnostics failed:', error)
})