const { chromium } = require('playwright');

(async () => {
  console.log('🔍 COMPLETE TEST - FINDING ALL ERRORS BEFORE MEETING\n');
  
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  const allErrors = [];
  
  // Capture ALL errors
  page.on('console', msg => {
    if (msg.type() === 'error') {
      allErrors.push({page: page.url(), error: msg.text()});
      console.log(`❌ ERROR: ${msg.text()}`);
    }
  });
  
  page.on('pageerror', err => {
    allErrors.push({page: page.url(), error: err.message});
    console.log(`❌ PAGE ERROR: ${err.message}`);
  });
  
  const baseUrl = 'https://arc-relationship-manager-v2.vercel.app';
  const pages = [
    { name: 'Dashboard', url: '/' },
    { name: 'Organizations', url: '/organizations' },
    { name: 'New Organization', url: '/organizations/new' },
    { name: 'People', url: '/people' },
    { name: 'New Person', url: '/people/new' },
    { name: 'Meetings', url: '/meetings' },
    { name: 'New Meeting', url: '/meetings/new' },
    { name: 'Map', url: '/map' },
    { name: 'Activity', url: '/activity' },
    { name: 'Tech Stack', url: '/tech-stack' },
    { name: 'Search', url: '/search' }
  ];
  
  for (const pageInfo of pages) {
    console.log(`\nTesting ${pageInfo.name}...`);
    await page.goto(baseUrl + pageInfo.url);
    await page.waitForTimeout(3000);
    
    // Check for visible errors
    const errorText = await page.locator('text=/error|failed|cannot/i').count();
    if (errorText > 0) {
      console.log(`  ⚠️ Error text visible on page`);
      const errors = await page.locator('text=/error|failed|cannot/i').allTextContents();
      errors.forEach(err => console.log(`    "${err}"`));
    } else {
      console.log(`  ✅ No visible errors`);
    }
    
    // Check for loading skeletons stuck
    const skeletons = await page.locator('.animate-pulse').count();
    if (skeletons > 0) {
      console.log(`  ⚠️ ${skeletons} loading skeleton(s) still showing`);
    }
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('TEST COMPLETE');
  console.log('='.repeat(60));
  
  if (allErrors.length === 0) {
    console.log('\n✅ NO ERRORS DETECTED - APP IS READY');
  } else {
    console.log(`\n❌ ${allErrors.length} ERRORS FOUND:\n`);
    allErrors.forEach((err, i) => {
      console.log(`${i + 1}. ${err.page}`);
      console.log(`   ${err.error}\n`);
    });
  }
  
  await browser.close();
})();