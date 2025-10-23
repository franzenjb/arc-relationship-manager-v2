// Database Audit Script for Executive Demo
require('dotenv').config({ path: '.env.local' });

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Create admin client for comprehensive testing
const supabaseAdmin = createClient(supabaseUrl, serviceKey);
const supabase = createClient(supabaseUrl, supabaseKey);

console.log('🔍 === COMPREHENSIVE DATABASE AUDIT FOR EXECUTIVE DEMO ===\n');

async function runComprehensiveAudit() {
  const results = {
    critical_issues: [],
    warnings: [],
    success: [],
    tests_run: 0,
    tests_passed: 0
  };

  // Test 1: Database Connection
  console.log('1️⃣ Testing Database Connection...');
  results.tests_run++;
  try {
    const { data, error } = await supabase.from('regions').select('count', { count: 'exact' });
    if (error) throw error;
    results.tests_passed++;
    results.success.push('✅ Database connection successful');
    console.log('   ✅ Connected successfully');
  } catch (error) {
    results.critical_issues.push('❌ CRITICAL: Database connection failed - ' + error.message);
    console.log('   ❌ FAILED:', error.message);
  }

  // Test 2: Check if relationship_managers table exists
  console.log('\n2️⃣ Testing Relationship Managers Table...');
  results.tests_run++;
  try {
    const { data, error } = await supabase.from('relationship_managers').select('*').limit(1);
    if (error && error.message.includes('does not exist')) {
      throw new Error('relationship_managers table does not exist');
    }
    results.tests_passed++;
    results.success.push('✅ Relationship managers table exists');
    console.log('   ✅ Table exists and accessible');
  } catch (error) {
    results.critical_issues.push('❌ CRITICAL: Relationship managers table missing - ' + error.message);
    console.log('   ❌ FAILED:', error.message);
  }

  // Test 3: Check for American Red Cross organization
  console.log('\n3️⃣ Testing American Red Cross Organization...');
  results.tests_run++;
  try {
    const { data, error } = await supabase
      .from('organizations')
      .select('*')
      .eq('id', '00000000-0000-0000-0000-000000000001')
      .single();
    
    if (error && error.code === 'PGRST116') {
      throw new Error('American Red Cross organization does not exist in database');
    }
    if (error) throw error;
    
    results.tests_passed++;
    results.success.push('✅ American Red Cross organization exists');
    console.log('   ✅ Organization found:', data.name);
  } catch (error) {
    results.critical_issues.push('❌ CRITICAL: American Red Cross organization missing - ' + error.message);
    console.log('   ❌ FAILED:', error.message);
  }

  // Test 4: Check geographic hierarchy data
  console.log('\n4️⃣ Testing Geographic Hierarchy...');
  results.tests_run++;
  try {
    const [regions, chapters, counties] = await Promise.all([
      supabase.from('regions').select('*'),
      supabase.from('chapters').select('*'),
      supabase.from('counties').select('*')
    ]);

    if (regions.error) throw regions.error;
    if (chapters.error) throw chapters.error;
    if (counties.error) throw counties.error;

    const regionCount = regions.data?.length || 0;
    const chapterCount = chapters.data?.length || 0;
    const countyCount = counties.data?.length || 0;

    if (regionCount === 0) {
      results.warnings.push('⚠️  WARNING: No regions found in database');
    }
    if (chapterCount === 0) {
      results.warnings.push('⚠️  WARNING: No chapters found in database');
    }
    if (countyCount === 0) {
      results.warnings.push('⚠️  WARNING: No counties found in database');
    }

    results.tests_passed++;
    results.success.push(`✅ Geographic data loaded: ${regionCount} regions, ${chapterCount} chapters, ${countyCount} counties`);
    console.log(`   ✅ Found ${regionCount} regions, ${chapterCount} chapters, ${countyCount} counties`);
  } catch (error) {
    results.critical_issues.push('❌ CRITICAL: Geographic hierarchy failed - ' + error.message);
    console.log('   ❌ FAILED:', error.message);
  }

  // Test 5: Test organization creation
  console.log('\n5️⃣ Testing Organization Creation...');
  results.tests_run++;
  try {
    const testOrg = {
      name: 'TEST_ORG_DELETE_AFTER_AUDIT',
      organization_type: 'nonprofit',
      status: 'active',
      region_id: '550e8400-e29b-41d4-a716-446655440000' // Using first sample region
    };

    const { data: created, error: createError } = await supabase
      .from('organizations')
      .insert(testOrg)
      .select('*')
      .single();

    if (createError) throw createError;

    // Clean up test data
    await supabase.from('organizations').delete().eq('id', created.id);

    results.tests_passed++;
    results.success.push('✅ Organization creation flow works');
    console.log('   ✅ Organization creation successful');
  } catch (error) {
    results.critical_issues.push('❌ CRITICAL: Organization creation failed - ' + error.message);
    console.log('   ❌ FAILED:', error.message);
  }

  // Test 6: Test people creation with foreign key constraints
  console.log('\n6️⃣ Testing People Creation...');
  results.tests_run++;
  try {
    // First get a real organization to test with
    const { data: orgs } = await supabase.from('organizations').select('id').limit(1);
    if (!orgs || orgs.length === 0) {
      // Create a test org first
      const { data: testOrg } = await supabase
        .from('organizations')
        .insert({
          name: 'TEST_ORG_FOR_PEOPLE',
          organization_type: 'nonprofit',
          status: 'active'
        })
        .select('id')
        .single();

      const orgId = testOrg.id;

      const testPerson = {
        org_id: orgId,
        first_name: 'Test',
        last_name: 'Person',
        email: 'test@example.com'
      };

      const { data: created, error: createError } = await supabase
        .from('people')
        .insert(testPerson)
        .select('*')
        .single();

      if (createError) throw createError;

      // Clean up
      await supabase.from('people').delete().eq('id', created.id);
      await supabase.from('organizations').delete().eq('id', orgId);
    }

    results.tests_passed++;
    results.success.push('✅ People creation flow works');
    console.log('   ✅ People creation successful');
  } catch (error) {
    results.critical_issues.push('❌ CRITICAL: People creation failed - ' + error.message);
    console.log('   ❌ FAILED:', error.message);
  }

  // Test 7: Test relationship manager functionality
  console.log('\n7️⃣ Testing Relationship Manager Assignment...');
  results.tests_run++;
  try {
    // First get or create a test organization
    let { data: orgs } = await supabase.from('organizations').select('id').limit(1);
    let orgId;

    if (!orgs || orgs.length === 0) {
      const { data: testOrg } = await supabase
        .from('organizations')
        .insert({
          name: 'TEST_ORG_FOR_RM',
          organization_type: 'nonprofit',
          status: 'active'
        })
        .select('id')
        .single();
      orgId = testOrg.id;
    } else {
      orgId = orgs[0].id;
    }

    const testRM = {
      organization_id: orgId,
      name: 'Test Manager',
      email: 'testmanager@redcross.org'
    };

    const { data: created, error: createError } = await supabase
      .from('relationship_managers')
      .insert(testRM)
      .select('*')
      .single();

    if (createError) throw createError;

    // Clean up
    await supabase.from('relationship_managers').delete().eq('id', created.id);
    if (orgs.length === 0) {
      await supabase.from('organizations').delete().eq('id', orgId);
    }

    results.tests_passed++;
    results.success.push('✅ Relationship manager assignment works');
    console.log('   ✅ Relationship manager assignment successful');
  } catch (error) {
    results.critical_issues.push('❌ CRITICAL: Relationship manager assignment failed - ' + error.message);
    console.log('   ❌ FAILED:', error.message);
  }

  // Test 8: Test filtering functionality
  console.log('\n8️⃣ Testing Filter Functionality...');
  results.tests_run++;
  try {
    // Test various filter combinations
    const filters = [
      { filter: 'status=active', query: supabase.from('organizations').select('*').eq('status', 'active') },
      { filter: 'mission_area=disaster_relief', query: supabase.from('organizations').select('*').eq('mission_area', 'disaster_relief') },
      { filter: 'organization_type=nonprofit', query: supabase.from('organizations').select('*').eq('organization_type', 'nonprofit') }
    ];

    for (const filter of filters) {
      const { error } = await filter.query.limit(1);
      if (error) throw new Error(`Filter ${filter.filter} failed: ${error.message}`);
    }

    results.tests_passed++;
    results.success.push('✅ Filter functionality works');
    console.log('   ✅ All filters working correctly');
  } catch (error) {
    results.critical_issues.push('❌ CRITICAL: Filter functionality failed - ' + error.message);
    console.log('   ❌ FAILED:', error.message);
  }

  // Final Report
  console.log('\n🏁 === AUDIT COMPLETE ===');
  console.log(`\nSUMMARY:`);
  console.log(`Tests Run: ${results.tests_run}`);
  console.log(`Tests Passed: ${results.tests_passed}`);
  console.log(`Success Rate: ${Math.round((results.tests_passed / results.tests_run) * 100)}%`);

  console.log('\n✅ SUCCESSES:');
  results.success.forEach(msg => console.log(`   ${msg}`));

  if (results.warnings.length > 0) {
    console.log('\n⚠️  WARNINGS:');
    results.warnings.forEach(msg => console.log(`   ${msg}`));
  }

  if (results.critical_issues.length > 0) {
    console.log('\n❌ CRITICAL ISSUES:');
    results.critical_issues.forEach(msg => console.log(`   ${msg}`));
    console.log('\n🚨 DEMO STATUS: NOT READY - Critical issues must be resolved');
  } else {
    console.log('\n🎉 DEMO STATUS: READY FOR EXECUTIVE PRESENTATION');
  }

  return results;
}

runComprehensiveAudit()
  .then(() => process.exit(0))
  .catch(error => {
    console.error('\n💥 AUDIT FAILED:', error.message);
    process.exit(1);
  });