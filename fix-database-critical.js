// CRITICAL DATABASE FIX FOR EXECUTIVE DEMO
require('dotenv').config({ path: '.env.local' });

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!serviceKey) {
  console.error('❌ CRITICAL: SUPABASE_SERVICE_ROLE_KEY not found in environment');
  process.exit(1);
}

// Create admin client
const supabaseAdmin = createClient(supabaseUrl, serviceKey);

console.log('🚨 === CRITICAL DATABASE FIX FOR EXECUTIVE DEMO ===\n');

async function fixCriticalIssues() {
  const fixes = [];
  const errors = [];

  try {
    console.log('1️⃣ Creating/Updating American Red Cross organization...');
    
    // First, let's see what tables we can access
    const { data: existingOrg, error: queryError } = await supabaseAdmin
      .from('organizations')
      .select('*')
      .eq('id', '00000000-0000-0000-0000-000000000001')
      .maybeSingle();

    if (queryError && !queryError.message.includes('PGRST116')) {
      console.log('   ⚠️  Query error:', queryError.message);
      errors.push(`Organizations table query failed: ${queryError.message}`);
    }

    // Try to upsert the American Red Cross organization
    const { data: redCrossOrg, error: orgError } = await supabaseAdmin
      .from('organizations')
      .upsert({
        id: '00000000-0000-0000-0000-000000000001',
        name: 'American Red Cross',
        mission_area: 'disaster_relief',
        organization_type: 'nonprofit',
        address: '431 18th Street NW',
        city: 'Washington',
        state: 'DC',
        zip: '20006',
        website: 'https://www.redcross.org',
        phone: '(202) 303-5000',
        notes: 'American Red Cross National Headquarters - Primary organization for relationship management system',
        status: 'active'
      }, {
        onConflict: 'id',
        ignoreDuplicates: false
      })
      .select('*');

    if (orgError) {
      console.log('   ❌ Failed to create Red Cross org:', orgError.message);
      errors.push(`Red Cross org creation failed: ${orgError.message}`);
    } else {
      console.log('   ✅ American Red Cross organization created/updated');
      fixes.push('✅ American Red Cross organization ready');
    }

    console.log('\n2️⃣ Adding Red Cross relationship managers...');
    
    // Create Red Cross staff as people first
    const redCrossStaff = [
      {
        org_id: '00000000-0000-0000-0000-000000000001',
        first_name: 'Sarah',
        last_name: 'Johnson',
        title: 'Regional Relationship Manager',
        email: 'sarah.johnson@redcross.org',
        phone: '(202) 303-5001',
        notes: 'Manages government and corporate partnerships in National Capital region'
      },
      {
        org_id: '00000000-0000-0000-0000-000000000001',
        first_name: 'Michael',
        last_name: 'Rodriguez',
        title: 'Healthcare Partnership Manager',
        email: 'michael.rodriguez@redcross.org',
        phone: '(202) 303-5002',
        notes: 'Coordinates with hospitals and healthcare systems for emergency response'
      },
      {
        org_id: '00000000-0000-0000-0000-000000000001',
        first_name: 'Dr. Amanda',
        last_name: 'Chen',
        title: 'Faith & Community Partnerships Director',
        email: 'amanda.chen@redcross.org',
        phone: '(202) 303-5003',
        notes: 'Manages relationships with faith-based and community organizations'
      }
    ];

    let staffCreated = 0;
    for (const staff of redCrossStaff) {
      const { error: staffError } = await supabaseAdmin
        .from('people')
        .upsert(staff, {
          onConflict: 'email',
          ignoreDuplicates: false
        });
      
      if (staffError) {
        console.log(`   ⚠️  Staff ${staff.first_name} ${staff.last_name}:`, staffError.message);
      } else {
        staffCreated++;
      }
    }
    
    console.log(`   ✅ Created ${staffCreated} Red Cross staff members`);
    fixes.push(`✅ Created ${staffCreated} Red Cross staff members`);

    console.log('\n3️⃣ Testing relationship manager functionality...');
    
    // Test if we can create relationship managers in the dedicated table
    const testRM = {
      organization_id: '00000000-0000-0000-0000-000000000001',
      name: 'Sarah Johnson',
      email: 'sarah.johnson@redcross.org',
      phone: '(202) 303-5001',
      notes: 'Primary relationship manager for this organization'
    };

    const { data: createdRM, error: rmError } = await supabaseAdmin
      .from('relationship_managers')
      .upsert(testRM, {
        onConflict: 'email',
        ignoreDuplicates: false
      })
      .select('*');

    if (rmError) {
      console.log('   ⚠️  Relationship manager table:', rmError.message);
      errors.push(`Relationship managers table issue: ${rmError.message}`);
    } else {
      console.log('   ✅ Relationship manager functionality working');
      fixes.push('✅ Relationship manager system operational');
    }

    console.log('\n4️⃣ Creating minimal sample data for demo...');
    
    // Create a few key organizations for the demo
    const sampleOrgs = [
      {
        name: 'FEMA Region III',
        mission_area: 'disaster_relief',
        organization_type: 'government',
        city: 'Philadelphia',
        state: 'PA',
        status: 'active',
        notes: 'Federal emergency management coordination partner'
      },
      {
        name: 'Johns Hopkins Hospital',
        mission_area: 'health_safety',
        organization_type: 'healthcare',
        city: 'Baltimore',
        state: 'MD',
        status: 'active',
        notes: 'Major medical center partnership for emergency response'
      },
      {
        name: 'United Way of the National Capital Area',
        mission_area: 'disaster_relief',
        organization_type: 'nonprofit',
        city: 'Arlington',
        state: 'VA',
        status: 'active',
        notes: 'Community coordination and volunteer mobilization partner'
      }
    ];

    let orgsCreated = 0;
    for (const org of sampleOrgs) {
      const { error: orgError } = await supabaseAdmin
        .from('organizations')
        .upsert(org, {
          onConflict: 'name',
          ignoreDuplicates: true
        });
      
      if (orgError) {
        console.log(`   ⚠️  Org ${org.name}:`, orgError.message);
      } else {
        orgsCreated++;
      }
    }
    
    console.log(`   ✅ Created ${orgsCreated} sample organizations for demo`);
    fixes.push(`✅ Created ${orgsCreated} demo organizations`);

    console.log('\n5️⃣ Running final validation...');
    
    // Final validation
    const validation = await Promise.all([
      supabaseAdmin.from('organizations').select('count', { count: 'exact' }),
      supabaseAdmin.from('people').select('count', { count: 'exact' }),
      supabaseAdmin.from('organizations').select('*').eq('id', '00000000-0000-0000-0000-000000000001').maybeSingle()
    ]);

    const [orgsCount, peopleCount, redCrossCheck] = validation;
    
    console.log('   📊 Final counts:');
    console.log(`      Organizations: ${orgsCount.count || 0}`);
    console.log(`      People: ${peopleCount.count || 0}`);
    console.log(`      Red Cross exists: ${redCrossCheck.data ? '✅ YES' : '❌ NO'}`);

    console.log('\n🏁 === CRITICAL FIX COMPLETE ===');
    
    if (fixes.length > 0) {
      console.log('\n✅ SUCCESSFUL FIXES:');
      fixes.forEach(fix => console.log(`   ${fix}`));
    }
    
    if (errors.length > 0) {
      console.log('\n⚠️  REMAINING ISSUES:');
      errors.forEach(error => console.log(`   ❌ ${error}`));
      console.log('\n🚨 Manual intervention may be required for some issues');
    }

    if (errors.length === 0) {
      console.log('\n🎉 DATABASE IS NOW READY FOR EXECUTIVE DEMO!');
      console.log('\nNEXT STEPS:');
      console.log('1. Visit http://localhost:3000 to test the application');
      console.log('2. Try creating a new organization');
      console.log('3. Try assigning relationship managers');
      console.log('4. Test the filter functionality');
    } else {
      console.log('\n⚠️  Database may have issues - please review above errors');
    }

  } catch (error) {
    console.error('\n💥 CRITICAL FIX FAILED:', error.message);
    console.error('\n🚨 Database repair unsuccessful!');
    process.exit(1);
  }
}

fixCriticalIssues();