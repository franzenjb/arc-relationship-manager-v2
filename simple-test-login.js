const { chromium } = require('playwright');

async function simpleTest() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  console.log('🧪 Simple Login Test\n');
  
  // Test Florida login
  console.log('1️⃣ Testing Florida login...');
  await page.goto('https://arc-relationship-manager-v2.vercel.app/login');
  
  // Take screenshot of login page
  await page.screenshot({ path: 'login-page.png' });
  console.log('   Screenshot saved: login-page.png');
  
  // Fill in Florida credentials
  await page.click('input[value="FLORIDA"]');
  await page.fill('input[type="password"]', 'RedCrossFlorida2025!');
  await page.fill('input[placeholder="Enter your name"]', 'Test User');
  
  // Click login button
  await page.click('button:has-text("Access System")');
  
  // Wait for navigation or error
  await page.waitForTimeout(3000);
  
  const currentUrl = page.url();
  console.log('   Current URL:', currentUrl);
  
  // Check if we're on organizations page
  if (currentUrl.includes('/organizations')) {
    console.log('   ✅ Login successful - redirected to organizations');
    
    // Take screenshot
    await page.screenshot({ path: 'organizations-page.png' });
    console.log('   Screenshot saved: organizations-page.png');
    
    // Check session storage
    const sessionData = await page.evaluate(() => ({
      region: sessionStorage.getItem('userRegion'),
      user: sessionStorage.getItem('userName'),
      loginTime: sessionStorage.getItem('loginTime')
    }));
    
    console.log('   Session data:', sessionData);
    
    // Check for any errors in console
    const consoleLogs = [];
    page.on('console', msg => consoleLogs.push(msg.text()));
    
    // Try to count organizations
    const orgCount = await page.evaluate(() => {
      const cards = document.querySelectorAll('[class*="card"], tr');
      return cards.length;
    });
    
    console.log('   Elements found on page:', orgCount);
    
  } else if (currentUrl.includes('/login')) {
    console.log('   ❌ Still on login page');
    
    // Check for error message
    const errorText = await page.textContent('div[class*="red"]').catch(() => null);
    if (errorText) {
      console.log('   Error message:', errorText);
    }
  }
  
  // Test direct access
  console.log('\n2️⃣ Testing direct access...');
  await page.goto('https://arc-relationship-manager-v2.vercel.app/organizations');
  await page.waitForTimeout(2000);
  
  const directUrl = page.url();
  console.log('   Direct access URL:', directUrl);
  
  if (directUrl.includes('/organizations')) {
    console.log('   ✅ Direct access works (login not enforced)');
  } else {
    console.log('   ❌ Redirected to login');
  }
  
  await browser.close();
  console.log('\n✅ Test complete');
}

simpleTest().catch(console.error);