require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

console.log('Supabase URL:', supabaseUrl ? 'Found' : 'Missing')
console.log('Supabase Key:', supabaseKey ? 'Found' : 'Missing')

const supabase = createClient(supabaseUrl, supabaseKey)

async function ensureRedCrossOrganization() {
  try {
    const redCrossId = '00000000-0000-0000-0000-000000000001'
    
    // Check if American Red Cross organization exists
    const { data: existing, error: checkError } = await supabase
      .from('organizations')
      .select('id')
      .eq('id', redCrossId)
      .single()

    if (checkError && checkError.code !== 'PGRST116') {
      throw checkError
    }

    if (!existing) {
      console.log('Creating American Red Cross organization...')
      
      // Create the American Red Cross organization
      const { data, error } = await supabase
        .from('organizations')
        .insert({
          id: redCrossId,
          name: 'American Red Cross',
          organization_type: 'nonprofit',
          status: 'active',
          mission_area: 'disaster_relief',
          address: '431 18th Street NW',
          city: 'Washington',
          state: 'DC',
          zip: '20006',
          website: 'https://www.redcross.org',
          phone: '1-800-RED-CROSS',
          notes: 'American Red Cross National Headquarters'
        })
        .select()

      if (error) {
        throw error
      }

      console.log('✅ American Red Cross organization created successfully:', data[0])
    } else {
      console.log('✅ American Red Cross organization already exists')
    }

  } catch (error) {
    console.error('❌ Error ensuring American Red Cross organization:', error)
    throw error
  }
}

// Run if called directly
if (require.main === module) {
  ensureRedCrossOrganization()
    .then(() => {
      console.log('Done!')
      process.exit(0)
    })
    .catch((error) => {
      console.error('Failed:', error)
      process.exit(1)
    })
}

module.exports = { ensureRedCrossOrganization }