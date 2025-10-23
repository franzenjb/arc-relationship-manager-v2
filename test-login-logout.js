const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false }); // Show browser
  const page = await browser.newPage();
  
  console.log('Testing login/logout functionality...\n');
  
  try {
    // Go to localhost
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');
    
    // Check initial state
    const jeffText = await page.locator('text=Jeff Franzen').count();
    if (jeffText > 0) {
      console.log('✅ Initially logged in as Jeff Franzen');
      
      // Find and click logout
      const logoutButton = page.locator('[aria-label="Sign out"], svg.lucide-log-out').first();
      if (await logoutButton.count() > 0) {
        console.log('Clicking logout...');
        await logoutButton.click();
        await page.waitForTimeout(2000);
        
        // Check if logged out
        const signInButton = await page.locator('button:has-text("Sign In")').count();
        if (signInButton > 0) {
          console.log('✅ Successfully logged out - Sign In button visible');
          
          // Click Sign In
          console.log('Clicking Sign In to log back in...');
          await page.locator('button:has-text("Sign In")').click();
          await page.waitForTimeout(2000);
          
          // Check if logged back in
          const jeffTextAfter = await page.locator('text=Jeff Franzen').count();
          if (jeffTextAfter > 0) {
            console.log('✅ Successfully logged back in!');
          } else {
            console.log('❌ Failed to log back in');
          }
        } else {
          console.log('❌ Logout failed - still shows as logged in');
        }
      } else {
        console.log('❌ Logout button not found');
      }
    } else {
      console.log('Starting logged out - clicking Sign In...');
      await page.locator('button:has-text("Sign In")').click();
      await page.waitForTimeout(2000);
      
      const jeffTextAfter = await page.locator('text=Jeff Franzen').count();
      if (jeffTextAfter > 0) {
        console.log('✅ Successfully logged in!');
      } else {
        console.log('❌ Sign In button not working');
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await browser.close();
  }
})();