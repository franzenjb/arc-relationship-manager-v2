const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false }); // Show browser so we can see
  const page = await browser.newPage();
  
  console.log('Testing LIVE Vercel site: https://arc-relationship-manager.vercel.app\n');
  
  try {
    // Clear any localStorage first
    await page.goto('https://arc-relationship-manager.vercel.app');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    // Take screenshot of initial state
    await page.screenshot({ path: 'vercel-initial.png' });
    console.log('Screenshot saved: vercel-initial.png');
    
    // Check what's visible
    const headerText = await page.locator('header').textContent();
    console.log('Header shows:', headerText);
    
    // Look for Jeff Franzen
    const jeffVisible = await page.locator('text=Jeff Franzen').count();
    const signInVisible = await page.locator('button:has-text("Sign In")').count();
    
    if (jeffVisible > 0) {
      console.log('Currently shows as logged in (Jeff Franzen visible)');
      
      // Try to find logout button
      const logoutIcon = await page.locator('svg.lucide-log-out').count();
      console.log('Logout icon found:', logoutIcon > 0);
      
      if (logoutIcon > 0) {
        console.log('Clicking logout icon...');
        await page.locator('svg.lucide-log-out').first().click();
        await page.waitForTimeout(3000);
        
        await page.screenshot({ path: 'vercel-after-logout.png' });
        console.log('Screenshot saved: vercel-after-logout.png');
        
        const signInAfterLogout = await page.locator('button:has-text("Sign In")').count();
        console.log('Sign In button visible after logout:', signInAfterLogout > 0);
        
        if (signInAfterLogout > 0) {
          console.log('Clicking Sign In button...');
          await page.locator('button:has-text("Sign In")').first().click();
          await page.waitForTimeout(3000);
          
          await page.screenshot({ path: 'vercel-after-signin.png' });
          console.log('Screenshot saved: vercel-after-signin.png');
          
          const jeffAfterSignIn = await page.locator('text=Jeff Franzen').count();
          console.log('Jeff Franzen visible after sign in:', jeffAfterSignIn > 0);
        }
      }
    } else if (signInVisible > 0) {
      console.log('Currently shows as logged out (Sign In visible)');
      console.log('Clicking Sign In button...');
      await page.locator('button:has-text("Sign In")').first().click();
      await page.waitForTimeout(3000);
      
      await page.screenshot({ path: 'vercel-after-signin.png' });
      console.log('Screenshot saved: vercel-after-signin.png');
      
      const jeffAfterSignIn = await page.locator('text=Jeff Franzen').count();
      console.log('Jeff Franzen visible after sign in:', jeffAfterSignIn > 0);
    }
    
    // Final state
    const finalHeader = await page.locator('header').textContent();
    console.log('\nFinal header state:', finalHeader);
    
  } catch (error) {
    console.error('Error:', error.message);
  }
  
  console.log('\nLeaving browser open for 10 seconds so you can see...');
  await page.waitForTimeout(10000);
  await browser.close();
})();