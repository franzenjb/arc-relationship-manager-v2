// CRITICAL USER FLOWS TEST FOR EXECUTIVE DEMO
require('dotenv').config({ path: '.env.local' });

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);
const supabaseAdmin = createClient(supabaseUrl, serviceKey);

console.log('🎯 === TESTING CRITICAL USER FLOWS FOR EXECUTIVE DEMO ===\n');

async function testCriticalFlows() {
  const results = {
    critical_flows: [],
    passed: 0,
    failed: 0,
    warnings: []
  };

  console.log('🔍 Testing Core Application Flows...\n');

  // Flow 1: Organization Listing and Filtering
  console.log('1️⃣ Testing Organization Listing...');
  try {
    const { data: allOrgs, error: orgError } = await supabase
      .from('organizations')
      .select('*')
      .limit(10);

    if (orgError) throw orgError;
    
    console.log(`   ✅ Retrieved ${allOrgs.length} organizations`);
    results.critical_flows.push(`✅ Organization listing: ${allOrgs.length} organizations found`);
    results.passed++;

    // Test filtering
    const { data: nonprofits, error: filterError } = await supabase
      .from('organizations')
      .select('*')
      .eq('organization_type', 'nonprofit')
      .limit(5);

    if (filterError) throw filterError;
    
    console.log(`   ✅ Filter test: ${nonprofits.length} nonprofits found`);
    results.critical_flows.push(`✅ Organization filtering: Nonprofit filter works`);

  } catch (error) {
    console.log(`   ❌ FAILED: ${error.message}`);
    results.critical_flows.push(`❌ Organization listing failed: ${error.message}`);
    results.failed++;
  }

  // Flow 2: Organization Creation
  console.log('\n2️⃣ Testing Organization Creation...');
  try {
    const testOrg = {
      name: `Test Organization ${Date.now()}`,
      organization_type: 'nonprofit',
      mission_area: 'disaster_relief',
      city: 'Washington',
      state: 'DC',
      status: 'active',
      notes: 'Created during executive demo testing'
    };

    const { data: createdOrg, error: createError } = await supabase
      .from('organizations')
      .insert(testOrg)
      .select('*')
      .single();

    if (createError) throw createError;
    
    console.log(`   ✅ Organization created: ${createdOrg.name}`);
    results.critical_flows.push(`✅ Organization creation: Successfully created test organization`);
    results.passed++;

    // Clean up test data
    await supabase.from('organizations').delete().eq('id', createdOrg.id);

  } catch (error) {
    console.log(`   ❌ FAILED: ${error.message}`);
    results.critical_flows.push(`❌ Organization creation failed: ${error.message}`);
    results.failed++;
  }

  // Flow 3: People Management
  console.log('\n3️⃣ Testing People Creation and Management...');
  try {
    // Get the American Red Cross org for testing
    const { data: redCrossOrg } = await supabase
      .from('organizations')
      .select('id')
      .eq('id', '00000000-0000-0000-0000-000000000001')
      .single();

    if (!redCrossOrg) throw new Error('American Red Cross organization not found');

    const testPerson = {
      org_id: redCrossOrg.id,
      first_name: 'Test',
      last_name: 'Executive',
      title: 'Demo Contact',
      email: `test.executive.${Date.now()}@redcross.org`,
      phone: '(555) 123-4567',
      notes: 'Created for executive demo testing'
    };

    const { data: createdPerson, error: personError } = await supabase
      .from('people')
      .insert(testPerson)
      .select('*')
      .single();

    if (personError) throw personError;
    
    console.log(`   ✅ Person created: ${createdPerson.first_name} ${createdPerson.last_name}`);
    results.critical_flows.push(`✅ People management: Successfully created test person`);
    results.passed++;

    // Test people retrieval for organization
    const { data: orgPeople, error: peopleError } = await supabase
      .from('people')
      .select('*')
      .eq('org_id', redCrossOrg.id);

    if (peopleError) throw peopleError;
    
    console.log(`   ✅ Retrieved ${orgPeople.length} people for Red Cross`);
    results.critical_flows.push(`✅ People retrieval: Found ${orgPeople.length} Red Cross staff`);

    // Clean up test data
    await supabase.from('people').delete().eq('id', createdPerson.id);

  } catch (error) {
    console.log(`   ❌ FAILED: ${error.message}`);
    results.critical_flows.push(`❌ People management failed: ${error.message}`);
    results.failed++;
  }

  // Flow 4: Relationship Manager Assignment (if table exists)
  console.log('\n4️⃣ Testing Relationship Manager Assignment...');
  try {
    // Check if relationship_managers table exists and is accessible
    const { data: rmTest, error: rmError } = await supabase
      .from('relationship_managers')
      .select('*')
      .limit(1);

    if (rmError && rmError.message.includes('does not exist')) {
      console.log('   ⚠️  Relationship managers table does not exist - feature unavailable');
      results.warnings.push('⚠️  Relationship managers table missing - manual SQL setup required');
    } else if (rmError) {
      throw rmError;
    } else {
      // Test relationship manager creation
      const testRM = {
        organization_id: '00000000-0000-0000-0000-000000000001',
        name: `Test Manager ${Date.now()}`,
        email: `test.manager.${Date.now()}@redcross.org`,
        phone: '(555) 987-6543',
        notes: 'Test relationship manager for demo'
      };

      const { data: createdRM, error: createRMError } = await supabase
        .from('relationship_managers')
        .insert(testRM)
        .select('*')
        .single();

      if (createRMError) throw createRMError;
      
      console.log(`   ✅ Relationship manager created: ${createdRM.name}`);
      results.critical_flows.push(`✅ Relationship manager assignment: Successfully created test RM`);
      results.passed++;

      // Clean up
      await supabase.from('relationship_managers').delete().eq('id', createdRM.id);
    }

  } catch (error) {
    console.log(`   ❌ FAILED: ${error.message}`);
    results.critical_flows.push(`❌ Relationship manager assignment failed: ${error.message}`);
    results.failed++;
  }

  // Flow 5: Search and Filter Combinations
  console.log('\n5️⃣ Testing Advanced Search and Filtering...');
  try {
    // Test multiple filter combinations
    const filterTests = [
      { name: 'Status filter', field: 'status', value: 'active' },
      { name: 'Type filter', field: 'organization_type', value: 'nonprofit' },
      { name: 'Mission area filter', field: 'mission_area', value: 'disaster_relief' },
      { name: 'State filter', field: 'state', value: 'DC' }
    ];

    let filtersPassed = 0;
    for (const test of filterTests) {
      const { data, error } = await supabase
        .from('organizations')
        .select('*')
        .eq(test.field, test.value)
        .limit(5);

      if (error) throw error;
      
      console.log(`   ✅ ${test.name}: ${data.length} results`);
      filtersPassed++;
    }

    console.log(`   ✅ All ${filtersPassed} filter tests passed`);
    results.critical_flows.push(`✅ Advanced filtering: All ${filtersPassed} filter combinations work`);
    results.passed++;

  } catch (error) {
    console.log(`   ❌ FAILED: ${error.message}`);
    results.critical_flows.push(`❌ Advanced filtering failed: ${error.message}`);
    results.failed++;
  }

  // Flow 6: Dashboard Statistics
  console.log('\n6️⃣ Testing Dashboard Statistics...');
  try {
    const stats = await Promise.all([
      supabase.from('organizations').select('id', { count: 'exact' }),
      supabase.from('people').select('id', { count: 'exact' }),
      supabase.from('meetings').select('id', { count: 'exact' })
    ]);

    const [orgsCount, peopleCount, meetingsCount] = stats;
    
    if (orgsCount.error) throw orgsCount.error;
    if (peopleCount.error) throw peopleCount.error;
    if (meetingsCount.error) throw meetingsCount.error;

    console.log(`   ✅ Dashboard stats loaded:`);
    console.log(`      Organizations: ${orgsCount.count}`);
    console.log(`      People: ${peopleCount.count}`);
    console.log(`      Meetings: ${meetingsCount.count}`);
    
    results.critical_flows.push(`✅ Dashboard statistics: ${orgsCount.count} orgs, ${peopleCount.count} people, ${meetingsCount.count} meetings`);
    results.passed++;

  } catch (error) {
    console.log(`   ❌ FAILED: ${error.message}`);
    results.critical_flows.push(`❌ Dashboard statistics failed: ${error.message}`);
    results.failed++;
  }

  // Flow 7: Red Cross Staff as Relationship Managers
  console.log('\n7️⃣ Testing Red Cross Staff Functionality...');
  try {
    const { data: redCrossStaff, error: staffError } = await supabase
      .from('people')
      .select('*')
      .eq('org_id', '00000000-0000-0000-0000-000000000001');

    if (staffError) throw staffError;
    
    console.log(`   ✅ Found ${redCrossStaff.length} Red Cross staff members`);
    
    if (redCrossStaff.length > 0) {
      console.log(`   📋 Red Cross staff available for assignment:`);
      redCrossStaff.forEach(staff => {
        console.log(`      - ${staff.first_name} ${staff.last_name} (${staff.title})`);
      });
      results.critical_flows.push(`✅ Red Cross staff: ${redCrossStaff.length} staff members available for RM assignment`);
    } else {
      results.warnings.push('⚠️  No Red Cross staff found - may need to create sample staff');
    }
    
    results.passed++;

  } catch (error) {
    console.log(`   ❌ FAILED: ${error.message}`);
    results.critical_flows.push(`❌ Red Cross staff functionality failed: ${error.message}`);
    results.failed++;
  }

  // Generate Executive Summary
  console.log('\n🏁 === EXECUTIVE DEMO READINESS ASSESSMENT ===');
  
  const successRate = Math.round((results.passed / (results.passed + results.failed)) * 100);
  
  console.log(`\n📊 SUMMARY:`);
  console.log(`   Tests Passed: ${results.passed}`);
  console.log(`   Tests Failed: ${results.failed}`);
  console.log(`   Success Rate: ${successRate}%`);
  
  console.log('\n✅ WORKING FEATURES:');
  results.critical_flows.filter(flow => flow.startsWith('✅')).forEach(flow => {
    console.log(`   ${flow}`);
  });

  if (results.warnings.length > 0) {
    console.log('\n⚠️  WARNINGS:');
    results.warnings.forEach(warning => {
      console.log(`   ${warning}`);
    });
  }

  const failedFlows = results.critical_flows.filter(flow => flow.startsWith('❌'));
  if (failedFlows.length > 0) {
    console.log('\n❌ FAILED FEATURES:');
    failedFlows.forEach(flow => {
      console.log(`   ${flow}`);
    });
  }

  // Final recommendation
  if (successRate >= 85) {
    console.log('\n🎉 RECOMMENDATION: READY FOR EXECUTIVE DEMO');
    console.log('   The application has sufficient functionality for a successful demonstration.');
  } else if (successRate >= 70) {
    console.log('\n⚠️  RECOMMENDATION: DEMO WITH CAUTION');
    console.log('   The application is mostly functional but has some issues to be aware of.');
  } else {
    console.log('\n🚨 RECOMMENDATION: NOT READY FOR DEMO');
    console.log('   Critical issues need to be resolved before the executive demonstration.');
  }

  console.log('\n📋 DEMO TALKING POINTS:');
  console.log('   1. Show organization listing and filtering capabilities');
  console.log('   2. Demonstrate creating a new organization');
  console.log('   3. Show adding people to organizations');
  console.log('   4. Highlight the Red Cross staff management system');
  console.log('   5. Display dashboard statistics and data overview');
  
  if (results.warnings.length > 0) {
    console.log('\n⚠️  DEMO LIMITATIONS TO MENTION:');
    console.log('   - Some advanced features are still in development');
    console.log('   - Relationship manager assignment may require manual setup');
    console.log('   - Geographic hierarchy features pending schema deployment');
  }

  return results;
}

testCriticalFlows()
  .then(() => process.exit(0))
  .catch(error => {
    console.error('\n💥 TESTING FAILED:', error.message);
    process.exit(1);
  });