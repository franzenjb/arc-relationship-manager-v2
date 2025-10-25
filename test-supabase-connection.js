const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://nkrwpuaohzayiaibnliz.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5rcndwdWFvaHpheWlhaWJubGl6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mjg1NzYxMTgsImV4cCI6MjA0NDE1MjExOH0.iJRkGM-2nD7bPlKa_gIhVy_0vN0AKrP3iEU5KJb7Xzw';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testConnection() {
  console.log('Testing Supabase connection...\n');
  
  try {
    // Test with a simple query
    const { data, error } = await supabase
      .from('organizations')
      .select('id, name')
      .limit(1);
    
    if (error) {
      console.log('Error:', error.message);
    } else {
      console.log('✅ Connection successful!');
      console.log('Sample data:', data);
    }
    
    // Check if geography table exists
    const { data: geoData, error: geoError } = await supabase
      .from('red_cross_geography')
      .select('id')
      .limit(1);
    
    if (geoError) {
      if (geoError.code === '42P01') {
        console.log('\n❌ Geography table does not exist yet');
      } else {
        console.log('\nGeography table error:', geoError.message);
      }
    } else {
      console.log('\n✅ Geography table exists!');
    }
    
  } catch (err) {
    console.error('Connection failed:', err);
  }
}

testConnection();