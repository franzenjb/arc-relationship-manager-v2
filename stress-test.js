const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  console.log('🔥 STRESS TESTING - Finding ALL Issues\n');
  
  let totalErrors = 0;
  
  // Aggressive error monitoring
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log(`❌ Console: ${msg.text()}`);
      totalErrors++;
    }
  });
  
  page.on('pageerror', err => {
    console.log(`❌ Page Error: ${err.message}`);
    totalErrors++;
  });
  
  page.on('requestfailed', request => {
    if (!request.url().includes('_next')) {
      console.log(`❌ Failed: ${request.url().substring(0, 80)}...`);
      totalErrors++;
    }
  });
  
  const baseUrl = 'https://arc-relationship-manager-v2.vercel.app';
  
  try {
    // Test 1: Homepage load
    console.log('1. Testing Homepage...');
    await page.goto(baseUrl);
    await page.waitForLoadState('networkidle');
    const dashboardStats = await page.locator('.grid .rounded-lg').count();
    console.log(`   Found ${dashboardStats} stat cards`);
    
    // Test 2: Organizations page and interactions
    console.log('\n2. Testing Organizations...');
    await page.goto(baseUrl + '/organizations');
    await page.waitForLoadState('networkidle');
    const orgCards = await page.locator('[class*="card"]').count();
    console.log(`   Found ${orgCards} organization cards`);
    
    // Test 3: Try to view an organization
    console.log('\n3. Testing Organization Details...');
    const firstOrgLink = page.locator('a[href^="/organizations/"]').first();
    if (await firstOrgLink.count() > 0) {
      await firstOrgLink.click();
      await page.waitForLoadState('networkidle');
      console.log(`   Viewing: ${page.url()}`);
    }
    
    // Test 4: People page
    console.log('\n4. Testing People...');
    await page.goto(baseUrl + '/people');
    await page.waitForLoadState('networkidle');
    const peopleCards = await page.locator('[class*="card"]').count();
    console.log(`   Found ${peopleCards} people cards`);
    
    // Test 5: Meetings page
    console.log('\n5. Testing Meetings...');
    await page.goto(baseUrl + '/meetings');
    await page.waitForLoadState('networkidle');
    const meetingCards = await page.locator('[class*="card"]').count();
    console.log(`   Found ${meetingCards} meeting cards`);
    
    // Test 6: Map page
    console.log('\n6. Testing Map...');
    await page.goto(baseUrl + '/map');
    await page.waitForLoadState('networkidle');
    const mapContainer = await page.locator('#map, .leaflet-container').count();
    console.log(`   Map container found: ${mapContainer > 0 ? 'Yes' : 'No'}`);
    
    // Test 7: Search functionality
    console.log('\n7. Testing Search...');
    await page.goto(baseUrl + '/search');
    await page.waitForLoadState('networkidle');
    const searchInput = await page.locator('input[type="search"], input[placeholder*="Search"]').count();
    console.log(`   Search input found: ${searchInput > 0 ? 'Yes' : 'No'}`);
    
    // Test 8: Activity page
    console.log('\n8. Testing Activity...');
    await page.goto(baseUrl + '/activity');
    await page.waitForLoadState('networkidle');
    
    // Test 9: Tech Stack
    console.log('\n9. Testing Tech Stack...');
    await page.goto(baseUrl + '/tech-stack');
    await page.waitForLoadState('networkidle');
    
    // Test 10: Forms
    console.log('\n10. Testing Forms...');
    await page.goto(baseUrl + '/organizations/new');
    await page.waitForLoadState('networkidle');
    const formInputs = await page.locator('input, textarea, select').count();
    console.log(`   Form inputs found: ${formInputs}`);
    
  } catch (error) {
    console.log(`\n❌ Test crashed: ${error.message}`);
    totalErrors++;
  }
  
  console.log('\n' + '='.repeat(50));
  console.log(`TOTAL ERRORS FOUND: ${totalErrors}`);
  
  if (totalErrors === 0) {
    console.log('✅ NO ERRORS DETECTED!');
  } else {
    console.log(`❌ ${totalErrors} ERRORS NEED FIXING`);
  }
  
  await browser.close();
})();