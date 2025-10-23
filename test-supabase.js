const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://yqucprgxgdnowjnzrtoz.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlxdWNwcmd4Z2Rub3dqbnpydG96Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEyMjQ5NzcsImV4cCI6MjA3NjgwMDk3N30.gvm88pvDBvr4L2ovapL0eZlQN7h6FU5wKH2Mkn-L8rM'

const supabase = createClient(supabaseUrl, supabaseKey)

async function test() {
  console.log('Testing Supabase connection...')
  
  // Test organizations
  const { data: orgs, error: orgError } = await supabase
    .from('organizations')
    .select('*')
  
  if (orgError) {
    console.error('Error fetching organizations:', orgError)
  } else {
    console.log(`✓ Organizations: ${orgs.length} records found`)
  }
  
  // Test people  
  const { data: people, error: peopleError } = await supabase
    .from('people')
    .select('*')
    
  if (peopleError) {
    console.error('Error fetching people:', peopleError)
  } else {
    console.log(`✓ People: ${people.length} records found`)
  }
  
  // Test meetings
  const { data: meetings, error: meetingError } = await supabase
    .from('meetings')
    .select('*')
    
  if (meetingError) {
    console.error('Error fetching meetings:', meetingError)
  } else {
    console.log(`✓ Meetings: ${meetings.length} records found`)
  }
}

test().catch(console.error)