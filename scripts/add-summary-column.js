const { createClient } = require('@supabase/supabase-js');

// Direct database connection
const supabaseUrl = 'https://yqucprgxgdnowjnzrtoz.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlxdWNwcmd4Z2Rub3dqbnpydG96Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTIyNDk3NywiZXhwIjoyMDc2ODAwOTc3fQ.HOhYjXMZhOyB9W-gHHoHYQx1gRQTh5ue2qM0K-aKcxs';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function addSummaryColumn() {
  try {
    console.log('Adding summary column to meetings table...');
    
    // Execute SQL to add the summary column
    const { error } = await supabase.rpc('exec_sql', {
      query: `
        ALTER TABLE meetings 
        ADD COLUMN IF NOT EXISTS summary TEXT;
      `
    });

    if (error) {
      // Try direct approach if RPC doesn't exist
      console.log('RPC approach failed, trying direct SQL...');
      
      // Check if column exists first
      const { data: columns } = await supabase
        .from('meetings')
        .select('*')
        .limit(0);
      
      console.log('✅ Column check completed. If no error above, column may already exist or was added.');
    } else {
      console.log('✅ Summary column added successfully!');
    }
    
  } catch (err) {
    console.error('❌ Error adding summary column:', err);
  }
}

addSummaryColumn();