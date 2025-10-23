// Test the dashboard stats function directly
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://okclryedqbghlhxzqyrw.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9rY2xyeWVkcWJnaGxoeHpxeXJ3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEwMzgzODMsImV4cCI6MjA3NjYxNDM4M30.cC9tlaNQoABPpcL_R_dxbxwjLAi2rDSm4MdBtaDsFg4'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testDashboardStats() {
  console.log('🧪 Testing dashboard stats function...')
  
  try {
    // Test the exact same function used in OrganizationService
    const [orgCount, peopleCount, meetingCount] = await Promise.all([
      supabase.from('organizations').select('id', { count: 'exact' }),
      supabase.from('people').select('id', { count: 'exact' }),
      supabase.from('meetings').select('id', { count: 'exact' })
    ])

    console.log('📊 Raw query results:')
    console.log('- Organizations query:', orgCount)
    console.log('- People query:', peopleCount)
    console.log('- Meetings query:', meetingCount)

    const stats = {
      total_organizations: orgCount.count || 0,
      total_people: peopleCount.count || 0,
      total_meetings: meetingCount.count || 0,
      recent_activities: 0
    }

    console.log('\n✅ Final stats object:')
    console.log(JSON.stringify(stats, null, 2))
    
    if (orgCount.error) console.error('Org error:', orgCount.error)
    if (peopleCount.error) console.error('People error:', peopleCount.error)
    if (meetingCount.error) console.error('Meeting error:', meetingCount.error)

  } catch (error) {
    console.error('❌ Error testing dashboard stats:', error)
  }
}

testDashboardStats()