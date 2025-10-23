const { createClient } = require('@supabase/supabase-js')

// V1 Database (source)
const v1Url = 'https://okclryedqbghlhxzqyrw.supabase.co'
const v1Key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9rY2xyeWVkcWJnaGxoeHpxeXJ3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEwMzgzODMsImV4cCI6MjA3NjYxNDM4M30.cC9tlaNQoABPpcL_R_dxbxwjLAi2rDSm4MdBtaDsFg4'

// V2 Database (destination)
const v2Url = 'https://yqucprgxgdnowjnzrtoz.supabase.co'
const v2Key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlxdWNwcmd4Z2Rub3dqbnpydG96Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEyMjQ5NzcsImV4cCI6MjA3NjgwMDk3N30.gvm88pvDBvr4L2ovapL0eZlQN7h6FU5wKH2Mkn-L8rM'

const v1 = createClient(v1Url, v1Key)
const v2 = createClient(v2Url, v2Key)

async function migrate() {
  console.log('🚀 Starting migration from V1 to V2...\n')
  
  try {
    // 1. Clear existing V2 data first
    console.log('🧹 Clearing existing V2 data...')
    
    // Delete in correct order due to foreign keys
    await v2.from('meeting_attendees').delete().neq('meeting_id', '00000000-0000-0000-0000-000000000000')
    await v2.from('meetings').delete().neq('id', '00000000-0000-0000-0000-000000000000')
    await v2.from('people').delete().neq('id', '00000000-0000-0000-0000-000000000000')
    await v2.from('organizations').delete().neq('id', '00000000-0000-0000-0000-000000000000')
    
    // 2. Fetch and migrate organizations
    console.log('\n📊 Migrating organizations...')
    const { data: v1Orgs, error: orgFetchError } = await v1
      .from('organizations')
      .select('*')
      .order('created_at', { ascending: true })
    
    if (orgFetchError) throw orgFetchError
    console.log(`   Found ${v1Orgs?.length || 0} organizations in V1`)
    
    if (v1Orgs && v1Orgs.length > 0) {
      // Clean organization data - remove fields that don't exist in V2
      const cleanedOrgs = v1Orgs.map(org => {
        const {
          county_id,
          region_id,
          relationship_managers,
          ...cleanOrg
        } = org
        
        // Set primary_contact_id to null temporarily (will update later)
        cleanOrg.primary_contact_id = null
        
        return cleanOrg
      })
      
      const { data: insertedOrgs, error: insertOrgError } = await v2
        .from('organizations')
        .insert(cleanedOrgs)
        .select()
      
      if (insertOrgError) throw insertOrgError
      console.log(`   ✅ Migrated ${insertedOrgs?.length || 0} organizations`)
    }
    
    // 3. Fetch and migrate people
    console.log('\n👥 Migrating people...')
    const { data: v1People, error: peopleFetchError } = await v1
      .from('people')
      .select('*')
      .order('created_at', { ascending: true })
    
    if (peopleFetchError) throw peopleFetchError
    console.log(`   Found ${v1People?.length || 0} people in V1`)
    
    if (v1People && v1People.length > 0) {
      // Clean people data - remove any extra fields
      const cleanedPeople = v1People.map(person => {
        const {
          organization, // Remove nested data if present
          ...cleanPerson
        } = person
        return cleanPerson
      })
      
      const { data: insertedPeople, error: insertPeopleError } = await v2
        .from('people')
        .insert(cleanedPeople)
        .select()
      
      if (insertPeopleError) throw insertPeopleError
      console.log(`   ✅ Migrated ${insertedPeople?.length || 0} people`)
    }
    
    // 4. Update primary contacts for organizations
    console.log('\n🔗 Updating organization primary contacts...')
    for (const org of v1Orgs || []) {
      if (org.primary_contact_id) {
        // Check if the person exists in V2
        const { data: personExists } = await v2
          .from('people')
          .select('id')
          .eq('id', org.primary_contact_id)
          .single()
        
        if (personExists) {
          await v2
            .from('organizations')
            .update({ primary_contact_id: org.primary_contact_id })
            .eq('id', org.id)
        }
      }
    }
    
    // 5. Fetch and migrate meetings
    console.log('\n📅 Migrating meetings...')
    const { data: v1Meetings, error: meetingsFetchError } = await v1
      .from('meetings')
      .select('*')
      .order('created_at', { ascending: true })
    
    if (meetingsFetchError) throw meetingsFetchError
    console.log(`   Found ${v1Meetings?.length || 0} meetings in V1`)
    
    if (v1Meetings && v1Meetings.length > 0) {
      // Clean meeting data
      const cleanedMeetings = v1Meetings.map(meeting => {
        const {
          organization, // Remove nested data if present
          attendees, // Remove nested data if present
          ...cleanMeeting
        } = meeting
        return cleanMeeting
      })
      
      const { data: insertedMeetings, error: insertMeetingsError } = await v2
        .from('meetings')
        .insert(cleanedMeetings)
        .select()
      
      if (insertMeetingsError) throw insertMeetingsError
      console.log(`   ✅ Migrated ${insertedMeetings?.length || 0} meetings`)
    }
    
    // 6. Fetch and migrate meeting attendees
    console.log('\n👥 Migrating meeting attendees...')
    const { data: v1Attendees, error: attendeesFetchError } = await v1
      .from('meeting_attendees')
      .select('*')
    
    if (attendeesFetchError) {
      console.log('   Note: Could not fetch attendees (table might not exist)')
    } else if (v1Attendees && v1Attendees.length > 0) {
      console.log(`   Found ${v1Attendees.length} attendee records`)
      
      // Insert attendees one by one to handle any FK issues
      let successCount = 0
      for (const attendee of v1Attendees) {
        const { error } = await v2
          .from('meeting_attendees')
          .insert(attendee)
        
        if (!error) successCount++
      }
      console.log(`   ✅ Migrated ${successCount} meeting attendee records`)
    }
    
    // Final summary
    console.log('\n' + '='.repeat(50))
    console.log('✅ MIGRATION COMPLETE!')
    console.log('='.repeat(50))
    
    // Get final counts from V2
    const { count: orgCount } = await v2.from('organizations').select('*', { count: 'exact', head: true })
    const { count: peopleCount } = await v2.from('people').select('*', { count: 'exact', head: true })
    const { count: meetingCount } = await v2.from('meetings').select('*', { count: 'exact', head: true })
    
    console.log('\n📊 V2 Database Summary:')
    console.log(`   • ${orgCount} organizations`)
    console.log(`   • ${peopleCount} people`)
    console.log(`   • ${meetingCount} meetings`)
    
  } catch (error) {
    console.error('\n❌ Migration failed:', error.message)
    console.error(error)
  }
}

migrate()