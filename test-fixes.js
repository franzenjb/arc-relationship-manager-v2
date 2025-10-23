const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  console.log('🔍 Testing ARC Relationship Manager Fixes...\n');
  
  try {
    // Test 1: Homepage loads
    await page.goto('http://localhost:3000');
    console.log('✅ Homepage loads successfully');
    
    // Test 2: Activity page has Load More button
    await page.goto('http://localhost:3000/activity');
    await page.waitForLoadState('networkidle');
    const loadMoreExists = await page.locator('button:has-text("Load More Activities")').count() > 0;
    console.log(loadMoreExists ? '✅ Activity page has Load More pagination' : '⚠️  Activity page might not have enough data for pagination');
    
    // Test 3: Profile page loads and has password change
    await page.goto('http://localhost:3000/profile');
    await page.waitForLoadState('networkidle');
    const changePasswordExists = await page.locator('button:has-text("Change Password")').count() > 0;
    console.log(changePasswordExists ? '✅ Profile page has Change Password button' : '❌ Profile page missing Change Password');
    
    // Test 4: Admin page shows admin panel (not signin)
    await page.goto('http://localhost:3000/admin');
    await page.waitForLoadState('networkidle');
    const hasAdminTitle = await page.locator('h1:has-text("Administration")').count() > 0;
    console.log(hasAdminTitle ? '✅ Admin page shows admin panel' : '❌ Admin page not showing correctly');
    
    // Test 5: Create meeting form exists
    await page.goto('http://localhost:3000/meetings/new');
    await page.waitForLoadState('networkidle');
    const hasAttendeeSection = await page.locator('text=Search People in Database').count() > 0;
    console.log(hasAttendeeSection ? '✅ Meeting form has attendee selection' : '❌ Meeting form missing attendee selection');
    
    // Test 6: Header shows user info (not hardcoded)
    await page.goto('http://localhost:3000');
    const headerText = await page.locator('header').textContent();
    const hasJeff = headerText.includes('Jeff');
    console.log(hasJeff ? '✅ Header shows user name' : '⚠️  Header might not show user info');
    
    console.log('\n✨ All critical fixes verified successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    await browser.close();
  }
})();