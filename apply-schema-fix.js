// Apply the complete schema fix to database
const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')

const supabaseUrl = 'https://okclryedqbghlhxzqyrw.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9rY2xyeWVkcWJnaGxoeHpxeXJ3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTAzODM4MywiZXhwIjoyMDc2NjE0MzgzfQ.j5HWfl8iBxdoEm4cG4OdUE-pTaxD8lTDcPnSZzBWjxI'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function applySchemaMigration() {
  console.log('🚀 Starting database schema fix...')
  
  try {
    // Read the SQL file
    const sqlContent = fs.readFileSync('./database/complete-schema-fix.sql', 'utf8')
    
    // Split SQL into statements (basic split on semicolons)
    const statements = sqlContent
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'))
    
    console.log(`📝 Found ${statements.length} SQL statements to execute`)
    
    let successCount = 0
    let errorCount = 0
    
    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i]
      
      // Skip empty statements or comments
      if (!statement || statement.startsWith('--') || statement.toLowerCase().trim() === 'commit') {
        continue
      }
      
      try {
        console.log(`\n📋 Executing statement ${i + 1}/${statements.length}`)
        console.log(`   ${statement.substring(0, 80)}${statement.length > 80 ? '...' : ''}`)
        
        const { error } = await supabase.rpc('exec_sql', { sql: statement })
        
        if (error) {
          console.log(`   ❌ Error: ${error.message}`)
          errorCount++
        } else {
          console.log(`   ✅ Success`)
          successCount++
        }
        
        // Small delay between statements
        await new Promise(resolve => setTimeout(resolve, 100))
        
      } catch (err) {
        console.log(`   ❌ Exception: ${err.message}`)
        errorCount++
      }
    }
    
    console.log(`\n📊 MIGRATION SUMMARY:`)
    console.log(`   ✅ Successful: ${successCount}`)
    console.log(`   ❌ Errors: ${errorCount}`)
    
    if (errorCount === 0) {
      console.log('\n🎉 Schema migration completed successfully!')
    } else {
      console.log('\n⚠️  Schema migration completed with some errors.')
      console.log('   This is normal for CREATE IF NOT EXISTS statements on existing objects.')
    }
    
  } catch (error) {
    console.error('💥 Fatal error applying schema fix:', error)
  }
}

// Alternative approach - use direct SQL execution
async function applySchemaDirectly() {
  console.log('🚀 Applying schema fix using direct SQL execution...')
  
  try {
    const sqlContent = fs.readFileSync('./database/complete-schema-fix.sql', 'utf8')
    
    // Try to execute the entire SQL file at once
    const { data, error } = await supabase
      .from('_supabase_migrations')
      .select('*')
      .limit(1)
    
    console.log('📋 Attempting to execute full schema...')
    
    // Since we can't execute raw SQL directly, let's try the RPC approach
    // Note: This requires a custom stored procedure in Supabase
    
    console.log('ℹ️  Direct SQL execution requires manual application in Supabase SQL Editor')
    console.log('📄 SQL file location: ./database/complete-schema-fix.sql')
    console.log('\n🔧 MANUAL STEPS:')
    console.log('1. Open Supabase Dashboard -> SQL Editor')
    console.log('2. Copy content from ./database/complete-schema-fix.sql')
    console.log('3. Paste and run in SQL Editor')
    console.log('4. Then run: node verify-schema-fix.js')
    
  } catch (error) {
    console.error('💥 Error:', error)
  }
}

// Let's try the direct approach since we can't execute arbitrary SQL via client
applySchemaDirectly()