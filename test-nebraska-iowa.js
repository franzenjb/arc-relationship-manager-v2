const { chromium } = require('playwright');

async function testNebraskaIowa() {
  const browser = await chromium.launch({ headless: false, slowMo: 500 });
  const page = await browser.newPage();
  
  console.log('🌽 Testing Nebraska/Iowa Region\n');
  
  // Step 1: Navigate to login page
  console.log('1️⃣ Navigating to login page...');
  await page.goto('https://arc-relationship-manager-v2.vercel.app/login');
  await page.waitForLoadState('networkidle');
  await page.screenshot({ path: 'nebraska-iowa-1-login.png' });
  console.log('   Screenshot saved: nebraska-iowa-1-login.png');
  
  // Step 2: Select Nebraska & Iowa region
  console.log('\n2️⃣ Selecting Nebraska & Iowa region...');
  await page.click('input[value="NEBRASKA_IOWA"]');
  await page.waitForTimeout(500);
  
  // Step 3: Enter password and name
  console.log('3️⃣ Entering credentials...');
  await page.fill('input[type="password"]', 'RedCrossMidwest2025!');
  await page.fill('input[placeholder="Enter your name"]', 'Midwest Coordinator');
  await page.waitForTimeout(500);
  
  // Step 4: Click login
  console.log('4️⃣ Logging in...');
  await page.click('button:has-text("Access System")');
  
  // Step 5: Wait for organizations page
  console.log('5️⃣ Waiting for organizations to load...');
  await page.waitForURL('**/organizations', { timeout: 15000 });
  await page.waitForTimeout(3000); // Let data fully load
  await page.screenshot({ path: 'nebraska-iowa-2-organizations.png', fullPage: true });
  console.log('   Screenshot saved: nebraska-iowa-2-organizations.png');
  
  // Count organizations
  const orgData = await page.evaluate(() => {
    // Try different selectors for org cards
    const cards = document.querySelectorAll('.organization-card, [class*="card"], .bg-white.rounded-lg.shadow');
    const tableRows = document.querySelectorAll('tbody tr');
    const elements = cards.length > 0 ? cards : tableRows;
    
    const orgs = [];
    elements.forEach(el => {
      const text = el.textContent || '';
      if (text.includes('NE') || text.includes('Nebraska')) {
        orgs.push('Nebraska org found');
      }
      if (text.includes('IA') || text.includes('Iowa')) {
        orgs.push('Iowa org found');
      }
      if (text.includes('FL') || text.includes('Florida')) {
        orgs.push('FLORIDA org found (should not be here!)');
      }
    });
    
    // Also get any visible text showing counts
    const pageText = document.body.textContent || '';
    
    return {
      elementCount: elements.length,
      nebraskaIowaOrgs: orgs,
      pageContainsNebraska: pageText.includes('Nebraska'),
      pageContainsIowa: pageText.includes('Iowa'),
      pageContainsFlorida: pageText.includes('Florida')
    };
  });
  
  console.log('\n📊 Organizations found:');
  console.log(`   Total elements: ${orgData.elementCount}`);
  console.log(`   Nebraska mentions: ${orgData.pageContainsNebraska}`);
  console.log(`   Iowa mentions: ${orgData.pageContainsIowa}`);
  console.log(`   Florida mentions: ${orgData.pageContainsFlorida}`);
  console.log(`   Organization breakdown: ${JSON.stringify(orgData.nebraskaIowaOrgs)}`);
  
  // Step 6: Navigate to map
  console.log('\n6️⃣ Navigating to map page...');
  await page.goto('https://arc-relationship-manager-v2.vercel.app/map');
  await page.waitForTimeout(5000); // Let map fully render
  await page.screenshot({ path: 'nebraska-iowa-3-map.png', fullPage: true });
  console.log('   Screenshot saved: nebraska-iowa-3-map.png');
  
  // Check map center (should be centered on Nebraska/Iowa)
  const mapInfo = await page.evaluate(() => {
    const mapContainer = document.querySelector('.leaflet-container');
    const mapTiles = document.querySelectorAll('.leaflet-tile');
    return {
      mapFound: !!mapContainer,
      tilesLoaded: mapTiles.length,
      pageText: document.body.textContent?.substring(0, 500)
    };
  });
  
  console.log('\n🗺️ Map Status:');
  console.log(`   Map found: ${mapInfo.mapFound}`);
  console.log(`   Map tiles loaded: ${mapInfo.tilesLoaded}`);
  
  // Step 7: Check session storage
  const sessionData = await page.evaluate(() => {
    return {
      region: sessionStorage.getItem('userRegion'),
      userName: sessionStorage.getItem('userName'),
      loginTime: sessionStorage.getItem('loginTime')
    };
  });
  
  console.log('\n🔐 Session Data:');
  console.log(`   Region: ${sessionData.region}`);
  console.log(`   User: ${sessionData.userName}`);
  console.log(`   Login Time: ${sessionData.loginTime}`);
  
  // Step 8: Try accessing People page
  console.log('\n7️⃣ Checking People page...');
  await page.goto('https://arc-relationship-manager-v2.vercel.app/people');
  await page.waitForTimeout(3000);
  await page.screenshot({ path: 'nebraska-iowa-4-people.png' });
  console.log('   Screenshot saved: nebraska-iowa-4-people.png');
  
  // Step 9: Try accessing Meetings page
  console.log('\n8️⃣ Checking Meetings page...');
  await page.goto('https://arc-relationship-manager-v2.vercel.app/meetings');
  await page.waitForTimeout(3000);
  await page.screenshot({ path: 'nebraska-iowa-5-meetings.png' });
  console.log('   Screenshot saved: nebraska-iowa-5-meetings.png');
  
  console.log('\n✅ Test complete! Check the screenshots to see:');
  console.log('   - nebraska-iowa-1-login.png (login screen)');
  console.log('   - nebraska-iowa-2-organizations.png (filtered orgs)');
  console.log('   - nebraska-iowa-3-map.png (Nebraska/Iowa centered map)');
  console.log('   - nebraska-iowa-4-people.png (filtered people)');
  console.log('   - nebraska-iowa-5-meetings.png (filtered meetings)');
  
  await browser.close();
}

testNebraskaIowa().catch(console.error);