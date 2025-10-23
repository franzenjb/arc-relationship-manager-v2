const { createClient } = require('@supabase/supabase-js');

// Direct database connection
const supabaseUrl = 'https://yqucprgxgdnowjnzrtoz.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlxdWNwcmd4Z2Rub3dqbnpydG96Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTIyNDk3NywiZXhwIjoyMDc2ODAwOTc3fQ.HOhYjXMZhOyB9W-gHHoHYQx1gRQTh5ue2qM0K-aKcxs';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function addMissingColumns() {
  console.log('🔧 Adding missing columns to meetings table...');
  
  // Add other_organizations column (array of organization IDs)
  try {
    const { data, error } = await supabase
      .from('meetings')
      .select('other_organizations')
      .limit(1);
    
    if (error && error.message.includes('column')) {
      console.log('❌ Column other_organizations does not exist, cannot add via JS');
      console.log('⚠️  Please run this SQL directly in Supabase SQL Editor:');
      console.log(`
ALTER TABLE meetings 
ADD COLUMN IF NOT EXISTS other_organizations UUID[] DEFAULT '{}';

COMMENT ON COLUMN meetings.other_organizations IS 'Array of organization IDs that attended the meeting';
      `);
    } else {
      console.log('✅ Column other_organizations already exists or check completed');
    }
  } catch (err) {
    console.error('Error checking other_organizations:', err.message);
  }

  // Add summary column if missing
  try {
    const { data, error } = await supabase
      .from('meetings')
      .select('summary')
      .limit(1);
    
    if (error && error.message.includes('column')) {
      console.log('❌ Column summary does not exist');
      console.log('⚠️  Please run this SQL directly in Supabase SQL Editor:');
      console.log(`
ALTER TABLE meetings 
ADD COLUMN IF NOT EXISTS summary TEXT;

COMMENT ON COLUMN meetings.summary IS 'Brief summary of meeting content and outcomes';
      `);
    } else {
      console.log('✅ Column summary already exists or check completed');
    }
  } catch (err) {
    console.error('Error checking summary:', err.message);
  }
}

addMissingColumns();