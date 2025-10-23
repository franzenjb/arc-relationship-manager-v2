const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://yqucprgxgdnowjnzrtoz.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlxdWNwcmd4Z2Rub3dqbnpydG96Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEyMjQ5NzcsImV4cCI6MjA3NjgwMDk3N30.gvm88pvDBvr4L2ovapL0eZlQN7h6FU5wKH2Mkn-L8rM'
);

async function removeDuplicates() {
  console.log('🔍 Finding duplicate organizations...\n');
  
  // Get all organizations
  const { data: orgs, error } = await supabase
    .from('organizations')
    .select('*')
    .order('name');
  
  if (error) {
    console.error('Error fetching organizations:', error);
    return;
  }
  
  // Find duplicates
  const nameGroups = {};
  orgs.forEach(org => {
    const key = org.name.toLowerCase().trim();
    if (!nameGroups[key]) nameGroups[key] = [];
    nameGroups[key].push(org);
  });
  
  const duplicateGroups = Object.values(nameGroups).filter(group => group.length > 1);
  
  if (duplicateGroups.length === 0) {
    console.log('✅ No duplicate organizations found!');
    return;
  }
  
  console.log(`Found ${duplicateGroups.length} sets of duplicates:\n`);
  
  for (const group of duplicateGroups) {
    console.log(`\nDuplicate: ${group[0].name}`);
    
    // Sort by created_at to keep the oldest one (or the one with more data)
    group.sort((a, b) => {
      // Prefer the one with more data
      const aDataCount = Object.values(a).filter(v => v !== null && v !== '').length;
      const bDataCount = Object.values(b).filter(v => v !== null && v !== '').length;
      if (aDataCount !== bDataCount) return bDataCount - aDataCount;
      
      // Otherwise keep the older one
      return new Date(a.created_at) - new Date(b.created_at);
    });
    
    const keepOrg = group[0];
    const deleteOrgs = group.slice(1);
    
    console.log(`  ✅ Keeping: ${keepOrg.id} (${keepOrg.city}, ${keepOrg.state})`);
    
    for (const org of deleteOrgs) {
      console.log(`  ❌ Deleting: ${org.id} (${org.city}, ${org.state})`);
      
      // First, update any references to point to the kept org
      // Update people
      const { error: peopleError } = await supabase
        .from('people')
        .update({ org_id: keepOrg.id })
        .eq('org_id', org.id);
      
      if (peopleError) {
        console.log(`    ⚠️ Error updating people references: ${peopleError.message}`);
      }
      
      // Update meetings
      const { error: meetingsError } = await supabase
        .from('meetings')
        .update({ org_id: keepOrg.id })
        .eq('org_id', org.id);
      
      if (meetingsError) {
        console.log(`    ⚠️ Error updating meetings references: ${meetingsError.message}`);
      }
      
      // Update lead_organization_id in meetings
      const { error: leadOrgError } = await supabase
        .from('meetings')
        .update({ lead_organization_id: keepOrg.id })
        .eq('lead_organization_id', org.id);
      
      if (leadOrgError) {
        console.log(`    ⚠️ Error updating lead org references: ${leadOrgError.message}`);
      }
      
      // Now delete the duplicate
      const { error: deleteError } = await supabase
        .from('organizations')
        .delete()
        .eq('id', org.id);
      
      if (deleteError) {
        console.log(`    ❌ Error deleting: ${deleteError.message}`);
      } else {
        console.log(`    ✅ Successfully deleted duplicate`);
      }
    }
  }
  
  console.log('\n✅ Duplicate removal complete!');
  
  // Verify results
  const { count } = await supabase
    .from('organizations')
    .select('*', { count: 'exact', head: true });
  
  console.log(`\nFinal organization count: ${count}`);
}

removeDuplicates();