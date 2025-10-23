// Add people and meetings data to complement the organizations
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://okclryedqbghlhxzqyrw.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9rY2xyeWVkcWJnaGxoeHpxeXJ3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTAzODM4MywiZXhwIjoyMDc2NjE0MzgzfQ.j5HWfl8iBxdoEm4cG4OdUE-pTaxD8lTDcPnSZzBWjxI'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function addPeopleAndMeetings() {
  console.log('🔍 Getting organization IDs...')
  
  // Get all organizations first
  const { data: orgs, error: orgError } = await supabase
    .from('organizations')
    .select('id, name')
  
  if (orgError) {
    console.error('❌ Error getting organizations:', orgError.message)
    return
  }
  
  console.log(`✅ Found ${orgs.length} organizations`)
  
  // People data - 2-3 people per organization
  const peopleData = [
    // FEMA Region III
    { org_id: orgs.find(o => o.name === 'FEMA Region III')?.id, first_name: 'Maria', last_name: 'Rodriguez', title: 'Regional Administrator', email: 'maria.rodriguez@fema.dhs.gov', phone: '(215) 931-5501', notes: 'Primary emergency coordination contact' },
    { org_id: orgs.find(o => o.name === 'FEMA Region III')?.id, first_name: 'David', last_name: 'Chen', title: 'Emergency Management Specialist', email: 'd.chen@fema.dhs.gov', phone: '(215) 931-5502', notes: 'Red Cross liaison specialist' },
    
    // Johns Hopkins Hospital
    { org_id: orgs.find(o => o.name === 'Johns Hopkins Hospital')?.id, first_name: 'Dr. Sarah', last_name: 'Johnson', title: 'Emergency Medicine Director', email: 'sjohnson@jhmi.edu', phone: '(410) 955-5001', notes: 'Disaster medical response coordinator' },
    { org_id: orgs.find(o => o.name === 'Johns Hopkins Hospital')?.id, first_name: 'Michael', last_name: 'Thompson', title: 'Community Relations Manager', email: 'm.thompson@jhmi.edu', phone: '(410) 955-5002', notes: 'Red Cross partnership liaison' },
    { org_id: orgs.find(o => o.name === 'Johns Hopkins Hospital')?.id, first_name: 'Lisa', last_name: 'Park', title: 'Volunteer Coordinator', email: 'lpark@jhmi.edu', phone: '(410) 955-5003', notes: 'Manages medical volunteer programs' },
    
    // Salvation Army NCA
    { org_id: orgs.find(o => o.name === 'Salvation Army NCA')?.id, first_name: 'Captain James', last_name: 'Wilson', title: 'Area Commander', email: 'james.wilson@uss.salvationarmy.org', phone: '(202) 756-2601', notes: 'Shelter operations coordinator' },
    { org_id: orgs.find(o => o.name === 'Salvation Army NCA')?.id, first_name: 'Rebecca', last_name: 'Martinez', title: 'Disaster Services Director', email: 'r.martinez@uss.salvationarmy.org', phone: '(202) 756-2602', notes: 'Joint response planning lead' },
    
    // Amazon Web Services
    { org_id: orgs.find(o => o.name === 'Amazon Web Services')?.id, first_name: 'Jennifer', last_name: 'Kim', title: 'Public Sector Partner Manager', email: 'jenkim@amazon.com', phone: '(206) 266-1001', notes: 'Nonprofit cloud services specialist' },
    { org_id: orgs.find(o => o.name === 'Amazon Web Services')?.id, first_name: 'Robert', last_name: 'Anderson', title: 'Solutions Architect', email: 'randerson@amazon.com', phone: '(206) 266-1002', notes: 'Disaster response technology solutions' },
    
    // Washington National Cathedral
    { org_id: orgs.find(o => o.name === 'Washington National Cathedral')?.id, first_name: 'Rev. Patricia', last_name: 'Williams', title: 'Canon for Social Justice', email: 'pwilliams@cathedral.org', phone: '(202) 537-6201', notes: 'Interfaith disaster coordination' },
    { org_id: orgs.find(o => o.name === 'Washington National Cathedral')?.id, first_name: 'Thomas', last_name: 'Brown', title: 'Community Outreach Director', email: 't.brown@cathedral.org', phone: '(202) 537-6202', notes: 'Faith community emergency response' }
  ]
  
  console.log('📝 Adding people...')
  const { data: people, error: peopleError } = await supabase
    .from('people')
    .insert(peopleData)
    .select()
  
  if (peopleError) {
    console.error('❌ Error adding people:', peopleError.message)
    return
  }
  
  console.log(`✅ Added ${people.length} people`)
  
  // Meetings data - recent and upcoming meetings
  const meetingsData = [
    // FEMA meetings
    { org_id: orgs.find(o => o.name === 'FEMA Region III')?.id, date: '2025-10-15', location: 'FEMA Regional Office, Philadelphia', summary: 'Quarterly disaster preparedness review and Red Cross coordination planning', follow_up_date: '2025-11-15' },
    { org_id: orgs.find(o => o.name === 'FEMA Region III')?.id, date: '2025-09-20', location: 'Virtual Meeting', summary: 'Hurricane season response protocols and resource allocation discussion', follow_up_date: '2025-10-25' },
    
    // Johns Hopkins meetings
    { org_id: orgs.find(o => o.name === 'Johns Hopkins Hospital')?.id, date: '2025-10-18', location: 'Johns Hopkins Hospital Conference Room A', summary: 'Medical surge capacity planning and Red Cross volunteer training coordination', follow_up_date: '2025-11-01' },
    { org_id: orgs.find(o => o.name === 'Johns Hopkins Hospital')?.id, date: '2025-10-25', location: 'Red Cross Chapter Office', summary: 'Joint emergency medical response drill planning meeting', follow_up_date: '2025-11-10' },
    { org_id: orgs.find(o => o.name === 'Johns Hopkins Hospital')?.id, date: '2025-09-30', location: 'Johns Hopkins Hospital', summary: 'Blood drive coordination and community health partnership review', follow_up_date: '2025-10-30' },
    
    // Salvation Army meetings
    { org_id: orgs.find(o => o.name === 'Salvation Army NCA')?.id, date: '2025-10-12', location: 'Salvation Army Headquarters, DC', summary: 'Winter shelter preparation and joint Red Cross emergency response planning', follow_up_date: '2025-11-05' },
    { org_id: orgs.find(o => o.name === 'Salvation Army NCA')?.id, date: '2025-10-22', location: 'Virtual Meeting', summary: 'Food service coordination during emergency responses and volunteer training', follow_up_date: '2025-11-12' },
    
    // AWS meetings
    { org_id: orgs.find(o => o.name === 'Amazon Web Services')?.id, date: '2025-10-20', location: 'AWS Government Cloud Office, Virginia', summary: 'Disaster response technology platform development and data security protocols', follow_up_date: '2025-11-20' },
    { org_id: orgs.find(o => o.name === 'Amazon Web Services')?.id, date: '2025-09-15', location: 'Red Cross National Headquarters', summary: 'Cloud infrastructure assessment for emergency communication systems', follow_up_date: '2025-10-15' },
    
    // Cathedral meetings
    { org_id: orgs.find(o => o.name === 'Washington National Cathedral')?.id, date: '2025-10-17', location: 'Washington National Cathedral', summary: 'Interfaith disaster response network coordination and community outreach planning', follow_up_date: '2025-11-07' },
    { org_id: orgs.find(o => o.name === 'Washington National Cathedral')?.id, date: '2025-10-28', location: 'Cathedral Community Center', summary: 'Faith-based emergency shelter coordination and volunteer recruitment', follow_up_date: '2025-11-15' },
    
    // Additional recent meetings
    { org_id: orgs.find(o => o.name === 'FEMA Region III')?.id, date: '2025-10-05', location: 'Red Cross Regional Office', summary: 'Post-hurricane response lessons learned and improvement recommendations', follow_up_date: '2025-11-05' },
    { org_id: orgs.find(o => o.name === 'Johns Hopkins Hospital')?.id, date: '2025-10-08', location: 'Hopkins Community Health Center', summary: 'Community resilience healthcare planning and emergency preparedness education', follow_up_date: '2025-11-08' }
  ]
  
  console.log('📅 Adding meetings...')
  const { data: meetings, error: meetingsError } = await supabase
    .from('meetings')
    .insert(meetingsData)
    .select()
  
  if (meetingsError) {
    console.error('❌ Error adding meetings:', meetingsError.message)
    return
  }
  
  console.log(`✅ Added ${meetings.length} meetings`)
  
  // Get updated counts
  const [orgCount, peopleCount, meetingCount] = await Promise.all([
    supabase.from('organizations').select('id', { count: 'exact' }),
    supabase.from('people').select('id', { count: 'exact' }),
    supabase.from('meetings').select('id', { count: 'exact' })
  ])
  
  console.log('\n🎉 Database now contains:')
  console.log(`📊 ${orgCount.count} organizations`)
  console.log(`👥 ${peopleCount.count} people`)
  console.log(`📅 ${meetingCount.count} meetings`)
  console.log('\n✅ ARC Relationship Manager now has realistic sample data!')
}

addPeopleAndMeetings().catch(console.error)