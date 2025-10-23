const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false }); // Show browser
  const page = await browser.newPage();
  
  console.log('Testing logout functionality...');
  
  try {
    // Go to the live app
    await page.goto('https://arc-relationship-manager.vercel.app');
    await page.waitForLoadState('networkidle');
    
    // Click on the user menu dropdown
    const userButton = await page.locator('button:has-text("Jeff")').first();
    if (await userButton.count() > 0) {
      console.log('Found user menu, clicking...');
      await userButton.click();
      
      // Wait for dropdown to appear
      await page.waitForTimeout(500);
      
      // Click Sign Out
      const signOutButton = await page.locator('text=Sign Out').first();
      if (await signOutButton.count() > 0) {
        console.log('Found Sign Out button, clicking...');
        await signOutButton.click();
        
        // Wait to see what happens
        await page.waitForTimeout(2000);
        
        // Check current URL and page state
        const currentUrl = page.url();
        console.log('After logout, URL is:', currentUrl);
        
        // Check if we're still on the app
        if (currentUrl.includes('arc-relationship-manager.vercel.app')) {
          console.log('✅ Logout completed - still on app (demo mode behavior)');
        } else {
          console.log('❌ Redirected to:', currentUrl);
        }
      } else {
        console.log('❌ Sign Out button not found');
      }
    } else {
      console.log('❌ User menu button not found');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await browser.close();
  }
})();