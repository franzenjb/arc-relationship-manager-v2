const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  console.log('🔍 TESTING ALL PAGES FOR ERRORS\n');
  console.log('=' .repeat(50));
  
  const baseUrl = 'https://arc-relationship-manager-v2.vercel.app';
  const pages = [
    '/',
    '/organizations', 
    '/people',
    '/meetings',
    '/map',
    '/activity',
    '/tech-stack',
    '/admin',
    '/profile',
    '/search'
  ];
  
  let errors = [];
  let working = [];
  
  // Monitor console errors
  page.on('console', msg => {
    if (msg.type() === 'error') {
      errors.push(`Console Error: ${msg.text()}`);
    }
  });
  
  page.on('pageerror', err => {
    errors.push(`Page Error: ${err.message}`);
  });
  
  // Test each page
  for (const path of pages) {
    console.log(`\nTesting ${path}...`);
    errors = []; // Reset errors for this page
    
    try {
      await page.goto(baseUrl + path, { waitUntil: 'networkidle' });
      
      // Check for error messages in the UI
      const errorElements = await page.locator('text=/error|failed|cannot/i').count();
      const hasLoadingStuck = await page.locator('.animate-pulse').count();
      
      // Wait a bit to catch any delayed errors
      await page.waitForTimeout(2000);
      
      if (errors.length > 0) {
        console.log(`  ❌ ERRORS FOUND:`);
        errors.forEach(err => console.log(`     ${err}`));
      } else if (errorElements > 0) {
        console.log(`  ⚠️  Error text found on page`);
      } else if (hasLoadingStuck > 0) {
        console.log(`  ⚠️  Loading skeleton still showing`);
      } else {
        console.log(`  ✅ Working`);
        working.push(path);
      }
      
    } catch (error) {
      console.log(`  ❌ FAILED: ${error.message}`);
      errors.push(error.message);
    }
  }
  
  // Summary
  console.log('\n' + '=' .repeat(50));
  console.log('SUMMARY:');
  console.log(`Working: ${working.length}/${pages.length} pages`);
  console.log(`Errors: ${pages.length - working.length} pages with issues`);
  
  await browser.close();
})();