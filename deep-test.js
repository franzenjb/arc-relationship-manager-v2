const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  console.log('🔍 DEEP TESTING - CHECKING FOR ALL ERRORS\n');
  
  const allErrors = [];
  const failedRequests = [];
  
  // Capture ALL console messages
  page.on('console', msg => {
    const text = msg.text();
    if (msg.type() === 'error' || text.includes('Error') || text.includes('Failed')) {
      allErrors.push({
        type: 'Console',
        message: text,
        url: page.url()
      });
      console.log(`❌ Console Error: ${text}`);
    }
  });
  
  // Capture page errors
  page.on('pageerror', err => {
    allErrors.push({
      type: 'Page Error',
      message: err.message,
      url: page.url()
    });
    console.log(`❌ Page Error: ${err.message}`);
  });
  
  // Capture failed network requests
  page.on('requestfailed', request => {
    failedRequests.push({
      url: request.url(),
      failure: request.failure()?.errorText,
      page: page.url()
    });
    console.log(`❌ Failed Request: ${request.url()}`);
    console.log(`   Reason: ${request.failure()?.errorText}`);
  });
  
  // Capture responses with errors
  page.on('response', response => {
    if (response.status() >= 400) {
      console.log(`⚠️  HTTP ${response.status()}: ${response.url()}`);
    }
  });
  
  const baseUrl = 'https://arc-relationship-manager-v2.vercel.app';
  
  console.log('Testing main page...\n');
  await page.goto(baseUrl, { waitUntil: 'networkidle' });
  await page.waitForTimeout(3000);
  
  // Click through navigation
  console.log('\nClicking Organizations...');
  await page.click('text=Organizations');
  await page.waitForTimeout(2000);
  
  console.log('\nClicking People...');
  await page.click('text=People');
  await page.waitForTimeout(2000);
  
  console.log('\nClicking Meetings...');
  await page.click('text=Meetings');
  await page.waitForTimeout(2000);
  
  console.log('\nClicking Map...');
  await page.click('text=Map');
  await page.waitForTimeout(2000);
  
  // Try to create a new organization
  console.log('\nTrying to create new organization...');
  await page.goto(baseUrl + '/organizations/new');
  await page.waitForTimeout(2000);
  
  // Check for any stuck loading states
  const loadingElements = await page.locator('.animate-pulse').count();
  if (loadingElements > 0) {
    console.log(`\n⚠️  ${loadingElements} loading skeletons still showing`);
  }
  
  // Final summary
  console.log('\n' + '='.repeat(50));
  console.log('FINAL RESULTS:');
  console.log(`Total Errors Found: ${allErrors.length}`);
  console.log(`Failed Network Requests: ${failedRequests.length}`);
  
  if (allErrors.length > 0) {
    console.log('\nError Details:');
    allErrors.forEach((err, i) => {
      console.log(`${i + 1}. [${err.type}] ${err.message}`);
    });
  }
  
  if (failedRequests.length > 0) {
    console.log('\nFailed Requests:');
    failedRequests.forEach((req, i) => {
      console.log(`${i + 1}. ${req.url}`);
      console.log(`   Reason: ${req.failure}`);
    });
  }
  
  await browser.close();
})();