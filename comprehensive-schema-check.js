// Comprehensive database schema check
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://okclryedqbghlhxzqyrw.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9rY2xyeWVkcWJnaGxoeHpxeXJ3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTAzODM4MywiZXhwIjoyMDc2NjE0MzgzfQ.j5HWfl8iBxdoEm4cG4OdUE-pTaxD8lTDcPnSZzBWjxI'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function checkTableStructure(tableName) {
  console.log(`\n📋 Checking ${tableName} table...`)
  
  try {
    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .limit(1)
    
    if (error) {
      console.log(`❌ ${tableName} table error:`, error.message)
      return { exists: false, error: error.message }
    } else {
      console.log(`✅ ${tableName} table exists`)
      if (data && data.length > 0) {
        console.log('   Columns:', Object.keys(data[0]))
        return { exists: true, columns: Object.keys(data[0]), sampleData: data[0] }
      } else {
        console.log('   Table exists but is empty')
        return { exists: true, columns: [], sampleData: null }
      }
    }
  } catch (error) {
    console.log(`❌ Error checking ${tableName}:`, error.message)
    return { exists: false, error: error.message }
  }
}

async function checkAllTables() {
  console.log('🔍 COMPREHENSIVE DATABASE SCHEMA CHECK')
  console.log('=====================================')
  
  const results = {}
  
  // Check all expected tables
  const tables = [
    'regions',
    'chapters', 
    'counties',
    'organizations',
    'people',
    'meetings',
    'attachments',
    'user_profiles',
    'activity_log',
    'relationship_managers'
  ]
  
  for (const table of tables) {
    results[table] = await checkTableStructure(table)
  }
  
  console.log('\n🔍 ANALYSIS OF MISSING COLUMNS')
  console.log('===============================')
  
  // Expected columns based on schema.sql and types.ts
  const expectedColumns = {
    organizations: [
      'id', 'name', 'mission_area', 'organization_type',
      'region_id', 'chapter_id', 'county_id',
      'address', 'city', 'state', 'zip', 'location',
      'website', 'phone', 'tags', 'notes', 'status',
      'search_vector', 'created_at', 'updated_at', 
      'created_by', 'updated_by', 'relationship_managers'
    ],
    people: [
      'id', 'org_id', 'first_name', 'last_name', 'title',
      'email', 'phone', 'notes', 'search_vector',
      'created_at', 'updated_at', 'created_by', 'updated_by'
    ],
    meetings: [
      'id', 'org_id', 'date', 'location', 'summary',
      'follow_up_date', 'attendees', 'search_vector',
      'created_at', 'updated_at', 'created_by', 'updated_by'
    ]
  }
  
  // Check for missing columns
  for (const [tableName, expected] of Object.entries(expectedColumns)) {
    if (results[tableName]?.exists) {
      const actual = results[tableName].columns || []
      const missing = expected.filter(col => !actual.includes(col))
      const extra = actual.filter(col => !expected.includes(col))
      
      if (missing.length > 0) {
        console.log(`\n⚠️  ${tableName} MISSING COLUMNS:`)
        missing.forEach(col => console.log(`   - ${col}`))
      }
      
      if (extra.length > 0) {
        console.log(`\n📝 ${tableName} EXTRA COLUMNS:`)
        extra.forEach(col => console.log(`   + ${col}`))
      }
      
      if (missing.length === 0 && extra.length === 0) {
        console.log(`\n✅ ${tableName} schema matches expectations`)
      }
    }
  }
  
  // Check relationship_managers table specifically
  if (results.relationship_managers?.exists) {
    console.log('\n✅ relationship_managers table exists (separate table approach)')
  } else {
    console.log('\n❌ relationship_managers table does NOT exist')
  }
  
  return results
}

checkAllTables().then(() => {
  console.log('\n🎯 SCHEMA CHECK COMPLETE')
}).catch(error => {
  console.error('❌ Fatal error:', error)
})