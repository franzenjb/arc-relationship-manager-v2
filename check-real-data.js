// Check what data is actually in the database
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://okclryedqbghlhxzqyrw.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9rY2xyeWVkcWJnaGxoeHpxeXJ3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTAzODM4MywiZXhwIjoyMDc2NjE0MzgzfQ.j5HWfl8iBxdoEm4cG4OdUE-pTaxD8lTDcPnSZzBWjxI'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function checkRealData() {
  console.log('🔍 Checking current database contents...')
  
  // Get counts from all tables
  const [orgResult, peopleResult, meetingResult] = await Promise.all([
    supabase.from('organizations').select('id', { count: 'exact' }),
    supabase.from('people').select('id', { count: 'exact' }),
    supabase.from('meetings').select('id', { count: 'exact' })
  ])
  
  console.log('\n📊 Current Database Counts:')
  console.log(`- Organizations: ${orgResult.count}`)
  console.log(`- People: ${peopleResult.count}`)
  console.log(`- Meetings: ${meetingResult.count}`)
  
  // Get sample of organizations to see what's actually there
  const { data: orgs } = await supabase
    .from('organizations')
    .select('name, city, state')
    .limit(10)
  
  console.log('\n🏢 Organizations in database:')
  orgs?.forEach((org, i) => {
    console.log(`${i + 1}. ${org.name} (${org.city}, ${org.state})`)
  })
  
  // Get sample of people
  const { data: people } = await supabase
    .from('people')
    .select('first_name, last_name, title')
    .limit(5)
  
  console.log('\n👥 People in database:')
  people?.forEach((person, i) => {
    console.log(`${i + 1}. ${person.first_name} ${person.last_name} - ${person.title}`)
  })
  
  // Get sample of meetings
  const { data: meetings } = await supabase
    .from('meetings')
    .select('date, location, summary')
    .limit(5)
  
  console.log('\n📅 Meetings in database:')
  meetings?.forEach((meeting, i) => {
    console.log(`${i + 1}. ${meeting.date} - ${meeting.location}`)
    console.log(`   ${meeting.summary?.substring(0, 100)}...`)
  })
}

checkRealData().catch(console.error)