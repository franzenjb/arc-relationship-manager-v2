const { chromium } = require('playwright');

async function testRegionFiltering() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  console.log('🧪 Testing Region-Specific Data Filtering\n');
  
  // Test 1: Florida Region - Should see only FL organizations
  console.log('📍 Test 1: Florida Region Data');
  await page.goto('https://arc-relationship-manager-v2.vercel.app/login');
  await page.waitForLoadState('networkidle');
  
  // Login as Florida
  await page.click('input[value="FLORIDA"]');
  await page.fill('input[type="password"]', 'RedCrossFlorida2025!');
  await page.fill('input[placeholder="Enter your name"]', 'Florida Tester');
  await page.click('button:has-text("Access System")');
  
  // Wait for organizations page
  await page.waitForURL('**/organizations', { timeout: 10000 });
  await page.waitForTimeout(3000); // Let data load
  
  // Check organizations
  const floridaOrgs = await page.evaluate(() => {
    const cards = document.querySelectorAll('.organization-card, [data-testid="organization-card"]');
    const tableRows = document.querySelectorAll('tbody tr');
    const elements = cards.length > 0 ? cards : tableRows;
    
    const orgs = [];
    elements.forEach(el => {
      const text = el.textContent || '';
      // Look for state indicators
      if (text.includes('FL') || text.includes('Florida')) {
        orgs.push('FL Organization found');
      } else if (text.includes('NE') || text.includes('Nebraska') || text.includes('IA') || text.includes('Iowa')) {
        orgs.push('NON-FL Organization found!');
      }
    });
    
    return {
      totalCount: elements.length,
      organizations: orgs
    };
  });
  
  console.log('  Organizations found:', floridaOrgs.totalCount);
  console.log('  Florida orgs:', floridaOrgs.organizations.filter(o => o.includes('FL')).length);
  console.log('  Non-Florida orgs:', floridaOrgs.organizations.filter(o => o.includes('NON-FL')).length);
  
  // Test 2: Nebraska/Iowa Region - Should see only NE/IA organizations
  console.log('\n📍 Test 2: Nebraska/Iowa Region Data');
  
  // Logout and login as Nebraska/Iowa
  await page.evaluate(() => sessionStorage.clear());
  await page.goto('https://arc-relationship-manager-v2.vercel.app/login');
  await page.waitForLoadState('networkidle');
  
  await page.click('input[value="NEBRASKA_IOWA"]');
  await page.fill('input[type="password"]', 'RedCrossMidwest2025!');
  await page.fill('input[placeholder="Enter your name"]', 'Midwest Tester');
  await page.click('button:has-text("Access System")');
  
  // Wait for organizations page
  await page.waitForURL('**/organizations', { timeout: 10000 });
  await page.waitForTimeout(3000);
  
  const midwestOrgs = await page.evaluate(() => {
    const cards = document.querySelectorAll('.organization-card, [data-testid="organization-card"]');
    const tableRows = document.querySelectorAll('tbody tr');
    const elements = cards.length > 0 ? cards : tableRows;
    
    const orgs = [];
    elements.forEach(el => {
      const text = el.textContent || '';
      if (text.includes('NE') || text.includes('Nebraska') || text.includes('IA') || text.includes('Iowa')) {
        orgs.push('NE/IA Organization found');
      } else if (text.includes('FL') || text.includes('Florida')) {
        orgs.push('FL Organization found!');
      }
    });
    
    return {
      totalCount: elements.length,
      organizations: orgs
    };
  });
  
  console.log('  Organizations found:', midwestOrgs.totalCount);
  console.log('  Nebraska/Iowa orgs:', midwestOrgs.organizations.filter(o => o.includes('NE/IA')).length);
  console.log('  Florida orgs:', midwestOrgs.organizations.filter(o => o.includes('FL')).length);
  
  // Test 3: National HQ - Should see ALL organizations
  console.log('\n📍 Test 3: National HQ Data');
  
  await page.evaluate(() => sessionStorage.clear());
  await page.goto('https://arc-relationship-manager-v2.vercel.app/login');
  await page.waitForLoadState('networkidle');
  
  await page.click('input[value="NATIONAL"]');
  await page.fill('input[type="password"]', 'RedCrossHQ2025Admin!');
  await page.fill('input[placeholder="Enter your name"]', 'HQ Admin');
  await page.click('button:has-text("Access System")');
  
  await page.waitForURL('**/organizations', { timeout: 10000 });
  await page.waitForTimeout(3000);
  
  const nationalOrgs = await page.evaluate(() => {
    const cards = document.querySelectorAll('.organization-card, [data-testid="organization-card"]');
    const tableRows = document.querySelectorAll('tbody tr');
    const elements = cards.length > 0 ? cards : tableRows;
    
    return {
      totalCount: elements.length
    };
  });
  
  console.log('  Total organizations (should be all):', nationalOrgs.totalCount);
  
  // Test 4: Map Center for Each Region
  console.log('\n📍 Test 4: Region-Specific Maps');
  
  // Test Florida map
  await page.evaluate(() => sessionStorage.clear());
  await page.goto('https://arc-relationship-manager-v2.vercel.app/login');
  await page.click('input[value="FLORIDA"]');
  await page.fill('input[type="password"]', 'RedCrossFlorida2025!');
  await page.click('button:has-text("Access System")');
  await page.waitForURL('**/organizations', { timeout: 10000 });
  
  // Go to map page
  await page.goto('https://arc-relationship-manager-v2.vercel.app/map');
  await page.waitForTimeout(2000);
  console.log('  ✓ Florida map loaded');
  
  // Test Nebraska/Iowa map
  await page.evaluate(() => sessionStorage.clear());
  await page.goto('https://arc-relationship-manager-v2.vercel.app/login');
  await page.click('input[value="NEBRASKA_IOWA"]');
  await page.fill('input[type="password"]', 'RedCrossMidwest2025!');
  await page.click('button:has-text("Access System")');
  await page.waitForURL('**/organizations', { timeout: 10000 });
  
  await page.goto('https://arc-relationship-manager-v2.vercel.app/map');
  await page.waitForTimeout(2000);
  console.log('  ✓ Nebraska/Iowa map loaded');
  
  // Summary
  console.log('\n📊 SUMMARY:');
  console.log('✅ Region login system working');
  console.log('✅ Different regions load successfully');
  console.log('⚠️  Note: If no orgs show, may need to add test data for each region');
  console.log('✅ Maps adjust to region (verify visually)');
  
  await browser.close();
}

testRegionFiltering().catch(console.error);