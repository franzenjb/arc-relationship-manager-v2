const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  console.log('Checking what is on the deployed page...');
  
  try {
    await page.goto('https://arc-relationship-manager.vercel.app');
    await page.waitForLoadState('networkidle');
    
    // Get page title
    const title = await page.title();
    console.log('Page title:', title);
    
    // Check for header content
    const headerText = await page.locator('header').textContent();
    console.log('Header contains:', headerText?.substring(0, 200));
    
    // Check for any buttons in header
    const buttons = await page.locator('header button').count();
    console.log('Number of buttons in header:', buttons);
    
    // Check for dropdown menus
    const dropdowns = await page.locator('[role="button"]').count();
    console.log('Number of dropdown triggers:', dropdowns);
    
    // Take screenshot
    await page.screenshot({ path: 'vercel-page.png' });
    console.log('Screenshot saved as vercel-page.png');
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await browser.close();
  }
})();