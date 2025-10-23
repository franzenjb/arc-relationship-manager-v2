const { createClient } = require('@supabase/supabase-js')

// V1 Database
const v1Url = 'https://okclryedqbghlhxzqyrw.supabase.co'
const v1Key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9rY2xyeWVkcWJnaGxoeHpxeXJ3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEwMzgzODMsImV4cCI6MjA3NjYxNDM4M30.cC9tlaNQoABPpcL_R_dxbxwjLAi2rDSm4MdBtaDsFg4'

const v1 = createClient(v1Url, v1Key)

async function checkSchema() {
  // Get one organization to see its structure
  const { data, error } = await v1
    .from('organizations')
    .select('*')
    .limit(1)
  
  if (error) {
    console.error('Error:', error)
  } else {
    console.log('V1 Organization columns:')
    if (data && data.length > 0) {
      console.log(Object.keys(data[0]))
      console.log('\nSample data:')
      console.log(JSON.stringify(data[0], null, 2))
    }
  }
}

checkSchema()