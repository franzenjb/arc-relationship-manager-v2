const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const supabaseUrl = 'https://nkrwpuaohzayiaibnliz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5rcndwdWFvaHpheWlhaWJubGl6Iiwicm9sZSI6InNlcnZpY2UiLCJpYXQiOjE3Mjg1NzYxMTgsImV4cCI6MjA0NDE1MjExOH0.7m7MUMJfLQHZO2L8F6AYHgZ_PvNH0L1PL3YMVpTxnCw';

const supabase = createClient(supabaseUrl, supabaseKey);

async function createTable() {
  console.log('🔨 Creating red_cross_geography table...\n');
  
  // Read the SQL migration
  const sql = fs.readFileSync('supabase/migrations/20251025_create_red_cross_geography.sql', 'utf8');
  
  // Execute the SQL
  const { error } = await supabase.rpc('exec_sql', { 
    sql_query: sql 
  }).single();
  
  if (error) {
    // Try alternative approach - execute via direct connection
    console.log('Note: Direct SQL execution not available via client.');
    console.log('\n📋 Please run this migration manually in Supabase Dashboard:');
    console.log('1. Go to: https://supabase.com/dashboard/project/nkrwpuaohzayiaibnliz/sql');
    console.log('2. Copy and paste the SQL from: supabase/migrations/20251025_create_red_cross_geography.sql');
    console.log('3. Click "Run"');
    console.log('\n✅ Then run: node load-geography-to-supabase.js');
  } else {
    console.log('✅ Table created successfully!');
    console.log('Now run: node load-geography-to-supabase.js');
  }
}

createTable().catch(console.error);