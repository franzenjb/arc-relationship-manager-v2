const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  console.log('Checking organizations dropdown...\n');
  
  await page.goto('https://arc-relationship-manager-v2.vercel.app/meetings/new');
  await page.waitForTimeout(3000);
  
  // Click the organization dropdown
  const orgDropdown = page.locator('button:has-text("Select organization")').first();
  if (await orgDropdown.count() > 0) {
    await orgDropdown.click();
    await page.waitForTimeout(1000);
    
    // Count American Red Cross entries
    const arcEntries = await page.locator('text="American Red Cross"').count();
    console.log(`American Red Cross appears ${arcEntries} times in dropdown`);
    
    // Get all org names
    const orgNames = await page.locator('[role="option"]').allTextContents();
    console.log('\nAll organizations in dropdown:');
    orgNames.forEach((name, i) => {
      if (name.includes('American Red Cross')) {
        console.log(`${i + 1}. ${name} <-- DUPLICATE`);
      } else {
        console.log(`${i + 1}. ${name}`);
      }
    });
  }
  
  await browser.close();
})();