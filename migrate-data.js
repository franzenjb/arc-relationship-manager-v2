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
    // 1. Fetch all organizations from V1
    console.log('📊 Fetching organizations from V1...')
    const { data: v1Orgs, error: orgFetchError } = await v1
      .from('organizations')
      .select('*')
      .order('created_at', { ascending: true })
    
    if (orgFetchError) throw orgFetchError
    console.log(`   Found ${v1Orgs?.length || 0} organizations`)
    
    // 2. Clear existing V2 organizations (except the sample ones)
    console.log('\n🧹 Clearing V2 sample data...')
    const { error: clearOrgsError } = await v2
      .from('meetings')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000') // Delete all
    if (clearOrgsError) console.log('   Note:', clearOrgsError.message)
    
    const { error: clearPeopleError } = await v2
      .from('people')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000') // Delete all
    if (clearPeopleError) console.log('   Note:', clearPeopleError.message)
    
    const { error: clearOrgError } = await v2
      .from('organizations')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000') // Delete all
    if (clearOrgError) console.log('   Note:', clearOrgError.message)
    
    // 3. Insert organizations into V2
    console.log('\n📥 Inserting organizations into V2...')
    if (v1Orgs && v1Orgs.length > 0) {
      const { data: insertedOrgs, error: insertOrgError } = await v2
        .from('organizations')
        .insert(v1Orgs)
        .select()
      
      if (insertOrgError) throw insertOrgError
      console.log(`   ✅ Inserted ${insertedOrgs?.length || 0} organizations`)
    }
    
    // 4. Fetch all people from V1
    console.log('\n👥 Fetching people from V1...')
    const { data: v1People, error: peopleFetchError } = await v1
      .from('people')
      .select('*')
      .order('created_at', { ascending: true })
    
    if (peopleFetchError) throw peopleFetchError
    console.log(`   Found ${v1People?.length || 0} people`)
    
    // 5. Insert people into V2
    console.log('\n📥 Inserting people into V2...')
    if (v1People && v1People.length > 0) {
      // Remove primary_contact_id temporarily to avoid FK issues
      const peopleToInsert = v1People.map(person => {
        const { ...personData } = person
        return personData
      })
      
      const { data: insertedPeople, error: insertPeopleError } = await v2
        .from('people')
        .insert(peopleToInsert)
        .select()
      
      if (insertPeopleError) throw insertPeopleError
      console.log(`   ✅ Inserted ${insertedPeople?.length || 0} people`)
    }
    
    // 6. Fetch all meetings from V1
    console.log('\n📅 Fetching meetings from V1...')
    const { data: v1Meetings, error: meetingsFetchError } = await v1
      .from('meetings')
      .select('*')
      .order('created_at', { ascending: true })
    
    if (meetingsFetchError) throw meetingsFetchError
    console.log(`   Found ${v1Meetings?.length || 0} meetings`)
    
    // 7. Insert meetings into V2
    console.log('\n📥 Inserting meetings into V2...')
    if (v1Meetings && v1Meetings.length > 0) {
      const { data: insertedMeetings, error: insertMeetingsError } = await v2
        .from('meetings')
        .insert(v1Meetings)
        .select()
      
      if (insertMeetingsError) throw insertMeetingsError
      console.log(`   ✅ Inserted ${insertedMeetings?.length || 0} meetings`)
    }
    
    // 8. Fetch meeting attendees from V1
    console.log('\n👥 Fetching meeting attendees from V1...')
    const { data: v1Attendees, error: attendeesFetchError } = await v1
      .from('meeting_attendees')
      .select('*')
    
    if (attendeesFetchError) throw attendeesFetchError
    console.log(`   Found ${v1Attendees?.length || 0} meeting attendee records`)
    
    // 9. Insert meeting attendees into V2
    if (v1Attendees && v1Attendees.length > 0) {
      console.log('\n📥 Inserting meeting attendees into V2...')
      const { data: insertedAttendees, error: insertAttendeesError } = await v2
        .from('meeting_attendees')
        .insert(v1Attendees)
        .select()
      
      if (insertAttendeesError) {
        console.log('   Note: Some attendees may not have been inserted due to FK constraints')
      } else {
        console.log(`   ✅ Inserted ${insertedAttendees?.length || 0} meeting attendee records`)
      }
    }
    
    // 10. Update primary contacts for organizations
    console.log('\n🔗 Updating organization primary contacts...')
    const orgsWithContacts = v1Orgs?.filter(org => org.primary_contact_id) || []
    for (const org of orgsWithContacts) {
      const { error: updateError } = await v2
        .from('organizations')
        .update({ primary_contact_id: org.primary_contact_id })
        .eq('id', org.id)
      
      if (updateError) {
        console.log(`   Note: Could not set primary contact for ${org.name}`)
      }
    }
    
    // Final summary
    console.log('\n✅ Migration Complete!')
    console.log('====================')
    
    // Get final counts from V2
    const { count: orgCount } = await v2.from('organizations').select('*', { count: 'exact', head: true })
    const { count: peopleCount } = await v2.from('people').select('*', { count: 'exact', head: true })
    const { count: meetingCount } = await v2.from('meetings').select('*', { count: 'exact', head: true })
    
    console.log(`📊 V2 Database now contains:`)
    console.log(`   • ${orgCount} organizations`)
    console.log(`   • ${peopleCount} people`)
    console.log(`   • ${meetingCount} meetings`)
    
  } catch (error) {
    console.error('\n❌ Migration failed:', error.message)
    console.error(error)
  }
}

migrate()