const { chromium } = require('playwright');

(async () => {
  console.log('🚨 EMERGENCY TEST - CHECKING APP STATUS\n');
  
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  let errors = [];
  
  // Capture all errors
  page.on('console', msg => {
    if (msg.type() === 'error') {
      errors.push(`Console: ${msg.text()}`);
    }
  });
  
  page.on('pageerror', err => {
    errors.push(`Page Error: ${err.message}`);
  });
  
  const baseUrl = 'https://arc-relationship-manager-v2.vercel.app';
  
  try {
    // Test Dashboard
    console.log('Testing Dashboard...');
    await page.goto(baseUrl);
    await page.waitForTimeout(3000);
    const dashboardError = await page.locator('text=/error|failed/i').count();
    console.log(`  Dashboard: ${dashboardError > 0 ? '❌ HAS ERRORS' : '✅ Working'}`);
    
    // Test Organizations
    console.log('\nTesting Organizations...');
    await page.goto(baseUrl + '/organizations');
    await page.waitForTimeout(3000);
    const orgCount = await page.locator('h3').count();
    const orgError = await page.locator('text=/error|failed/i').count();
    console.log(`  Organizations: ${orgError > 0 ? '❌ HAS ERRORS' : `✅ ${orgCount} orgs showing`}`);
    
    // Check for duplicate American Red Cross
    const arcCount = await page.locator('text="American Red Cross"').count();
    if (arcCount > 1) {
      console.log(`  ⚠️ American Red Cross appears ${arcCount} times`);
    }
    
    // Test People
    console.log('\nTesting People...');
    await page.goto(baseUrl + '/people');
    await page.waitForTimeout(3000);
    const peopleError = await page.locator('text=/error|failed/i').count();
    console.log(`  People: ${peopleError > 0 ? '❌ HAS ERRORS' : '✅ Working'}`);
    
    // Test Meetings
    console.log('\nTesting Meetings...');
    await page.goto(baseUrl + '/meetings');
    await page.waitForTimeout(3000);
    const meetingsError = await page.locator('text=/error|failed/i').count();
    console.log(`  Meetings: ${meetingsError > 0 ? '❌ HAS ERRORS' : '✅ Working'}`);
    
    // Test New Organization Form
    console.log('\nTesting New Organization Form...');
    await page.goto(baseUrl + '/organizations/new');
    await page.waitForTimeout(2000);
    const formError = await page.locator('text=/error|failed/i').count();
    console.log(`  New Org Form: ${formError > 0 ? '❌ HAS ERRORS' : '✅ Working'}`);
    
  } catch (error) {
    console.log(`\n❌ CRITICAL ERROR: ${error.message}`);
  }
  
  console.log('\n' + '='.repeat(50));
  if (errors.length > 0) {
    console.log('ERRORS FOUND:');
    errors.forEach(err => console.log(`  - ${err}`));
  } else {
    console.log('✅ NO CRITICAL ERRORS DETECTED');
  }
  
  await browser.close();
})();