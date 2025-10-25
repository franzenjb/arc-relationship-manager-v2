const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://yqucprgxgdnowjnzrtoz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlxdWNwcmd4Z2Rub3dqbnpydG96Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEyMjQ5NzcsImV4cCI6MjA3NjgwMDk3N30.gvm88pvDBvr4L2ovapL0eZlQN7h6FU5wKH2Mkn-L8rM';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSchema() {
  // Get one organization to see its structure
  const { data, error } = await supabase
    .from('organizations')
    .select('*')
    .limit(1);
    
  if (error) {
    console.error('Error:', error);
    return;
  }
  
  if (data && data.length > 0) {
    console.log('Organization table columns:');
    console.log(Object.keys(data[0]));
    console.log('\nSample organization:');
    console.log(JSON.stringify(data[0], null, 2));
  } else {
    console.log('No organizations found in database');
  }
}

checkSchema();