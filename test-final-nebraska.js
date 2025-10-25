const { chromium } = require('playwright');

async function testNebraskaIowaComplete() {
  const browser = await chromium.launch({ headless: false, slowMo: 300 });
  const page = await browser.newPage();
  
  console.log('🌽 Final Test: Nebraska/Iowa Region with Map\n');
  
  // Login as Nebraska/Iowa
  console.log('1️⃣ Logging in as Nebraska/Iowa...');
  await page.goto('https://arc-relationship-manager-v2.vercel.app/login');
  await page.waitForLoadState('networkidle');
  
  await page.click('input[value="NEBRASKA_IOWA"]');
  await page.fill('input[type="password"]', 'RedCrossMidwest2025!');
  await page.fill('input[placeholder="Enter your name"]', 'Midwest Regional Coordinator');
  await page.click('button:has-text("Access System")');
  
  // Wait for organizations page
  console.log('2️⃣ Checking organizations page...');
  await page.waitForURL('**/organizations', { timeout: 15000 });
  await page.waitForTimeout(3000);
  
  // Count Nebraska/Iowa orgs
  const orgCount = await page.evaluate(() => {
    const cards = document.querySelectorAll('.organization-card, [class*="rounded-lg shadow"]');
    const nebraskaOrgs = Array.from(cards).filter(card => 
      card.textContent?.includes('NE') || card.textContent?.includes('Nebraska')
    );
    const iowaOrgs = Array.from(cards).filter(card => 
      card.textContent?.includes('IA') || card.textContent?.includes('Iowa')
    );
    const floridaOrgs = Array.from(cards).filter(card => 
      card.textContent?.includes('FL') || card.textContent?.includes('Florida')
    );
    
    return {
      total: cards.length,
      nebraska: nebraskaOrgs.length,
      iowa: iowaOrgs.length,
      florida: floridaOrgs.length
    };
  });
  
  console.log(`   ✅ Organizations: ${orgCount.total} total`);
  console.log(`      - Nebraska: ${orgCount.nebraska}`);
  console.log(`      - Iowa: ${orgCount.iowa}`);
  console.log(`      - Florida: ${orgCount.florida} (should be 0)`);
  
  // Navigate to map
  console.log('\n3️⃣ Navigating to map page...');
  await page.goto('https://arc-relationship-manager-v2.vercel.app/map');
  await page.waitForTimeout(5000);
  
  // Check map title
  const mapTitle = await page.textContent('h1');
  console.log(`   Map title: "${mapTitle}"`);
  
  // Check if map is centered on Midwest
  const mapInfo = await page.evaluate(() => {
    // Check if map has loaded
    const mapContainer = document.querySelector('.leaflet-container');
    const mapTiles = document.querySelectorAll('.leaflet-tile');
    
    // Check organizations in sidebar
    const sidebarOrgs = document.querySelectorAll('[class*="Organizations List"] .cursor-pointer');
    
    return {
      mapFound: !!mapContainer,
      tilesLoaded: mapTiles.length,
      sidebarOrgCount: sidebarOrgs.length,
      pageText: document.body.textContent?.includes('Nebraska') || document.body.textContent?.includes('Iowa')
    };
  });
  
  console.log(`   Map loaded: ${mapInfo.mapFound}`);
  console.log(`   Map tiles: ${mapInfo.tilesLoaded}`);
  console.log(`   Organizations in sidebar: ${mapInfo.sidebarOrgCount}`);
  console.log(`   Page mentions NE/IA: ${mapInfo.pageText}`);
  
  // Take screenshot
  await page.screenshot({ path: 'nebraska-iowa-final-map.png', fullPage: true });
  console.log('\n📸 Screenshot saved: nebraska-iowa-final-map.png');
  
  console.log('\n✅ Test Complete!');
  console.log('The Nebraska/Iowa region should show:');
  console.log('- Only NE/IA organizations (no Florida)');
  console.log('- Map centered on Midwest region');
  console.log('- Title showing "Nebraska & Iowa Organizations Map"');
  
  await browser.close();
}

testNebraskaIowaComplete().catch(console.error);