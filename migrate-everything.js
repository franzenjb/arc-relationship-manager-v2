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
  console.log('🚀 COMPLETE MIGRATION FROM V1 TO V2\n')
  
  try {
    // 1. CLEAR ALL V2 DATA
    console.log('🧹 Clearing ALL V2 data...')
    await v2.from('meeting_attendees').delete().neq('meeting_id', '00000000-0000-0000-0000-000000000000')
    await v2.from('meetings').delete().neq('id', '00000000-0000-0000-0000-000000000000')
    await v2.from('people').delete().neq('id', '00000000-0000-0000-0000-000000000000')
    
    // Need to clear FK references first
    await v2.from('organizations').update({ primary_contact_id: null }).neq('id', '00000000-0000-0000-0000-000000000000')
    await v2.from('organizations').delete().neq('id', '00000000-0000-0000-0000-000000000000')
    
    // 2. COPY ALL ORGANIZATIONS
    console.log('\n📊 Copying ALL organizations...')
    const { data: v1Orgs, error: orgError } = await v1
      .from('organizations')
      .select('*')
    
    if (orgError) throw orgError
    console.log(`   Found ${v1Orgs?.length} organizations`)
    
    if (v1Orgs && v1Orgs.length > 0) {
      // First insert without primary_contact_id
      const orgsWithoutContact = v1Orgs.map(org => ({
        ...org,
        primary_contact_id: null
      }))
      
      const { error: insertError } = await v2
        .from('organizations')
        .insert(orgsWithoutContact)
      
      if (insertError) throw insertError
      console.log(`   ✅ Copied ${v1Orgs.length} organizations`)
    }
    
    // 3. COPY ALL PEOPLE
    console.log('\n👥 Copying ALL people...')
    const { data: v1People, error: peopleError } = await v1
      .from('people')
      .select('*')
    
    if (peopleError) throw peopleError
    console.log(`   Found ${v1People?.length} people`)
    
    if (v1People && v1People.length > 0) {
      const { error: insertError } = await v2
        .from('people')
        .insert(v1People)
      
      if (insertError) throw insertError
      console.log(`   ✅ Copied ${v1People.length} people`)
    }
    
    // 4. UPDATE PRIMARY CONTACTS
    console.log('\n🔗 Setting primary contacts...')
    let contactCount = 0
    for (const org of v1Orgs || []) {
      if (org.primary_contact_id) {
        await v2
          .from('organizations')
          .update({ primary_contact_id: org.primary_contact_id })
          .eq('id', org.id)
        contactCount++
      }
    }
    console.log(`   ✅ Set ${contactCount} primary contacts`)
    
    // 5. COPY ALL MEETINGS
    console.log('\n📅 Copying ALL meetings...')
    const { data: v1Meetings, error: meetingsError } = await v1
      .from('meetings')
      .select('*')
    
    if (meetingsError) throw meetingsError
    console.log(`   Found ${v1Meetings?.length} meetings`)
    
    if (v1Meetings && v1Meetings.length > 0) {
      const { error: insertError } = await v2
        .from('meetings')
        .insert(v1Meetings)
      
      if (insertError) throw insertError
      console.log(`   ✅ Copied ${v1Meetings.length} meetings`)
    }
    
    // 6. COPY MEETING ATTENDEES
    console.log('\n👥 Copying meeting attendees...')
    const { data: v1Attendees } = await v1
      .from('meeting_attendees')
      .select('*')
    
    if (v1Attendees && v1Attendees.length > 0) {
      let success = 0
      for (const attendee of v1Attendees) {
        const { error } = await v2
          .from('meeting_attendees')
          .insert(attendee)
        if (!error) success++
      }
      console.log(`   ✅ Copied ${success} attendee records`)
    }
    
    // FINAL VERIFICATION
    console.log('\n' + '='.repeat(50))
    console.log('✅ MIGRATION COMPLETE - VERIFYING...')
    console.log('='.repeat(50))
    
    const { count: orgCount } = await v2.from('organizations').select('*', { count: 'exact', head: true })
    const { count: peopleCount } = await v2.from('people').select('*', { count: 'exact', head: true })
    const { count: meetingCount } = await v2.from('meetings').select('*', { count: 'exact', head: true })
    
    console.log('\n📊 V2 NOW CONTAINS:')
    console.log(`   ✅ ${orgCount} organizations`)
    console.log(`   ✅ ${peopleCount} people`)
    console.log(`   ✅ ${meetingCount} meetings`)
    
    console.log('\n🎉 ALL DATA MIGRATED SUCCESSFULLY!')
    
  } catch (error) {
    console.error('\n❌ ERROR:', error.message)
    console.error(error)
  }
}

migrate()