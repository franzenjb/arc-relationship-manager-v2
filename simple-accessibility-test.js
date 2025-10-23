const { chromium } = require('playwright');

const BASE_URL = 'https://arc-relationship-manager-6dtdttk8y-jbf-2539-e1ec6bfb.vercel.app';

async function quickAccessibilityTest() {
    console.log('🔍 QUICK ACCESSIBILITY TEST FOR CLEANUP VERSION');
    console.log(`📍 Testing URL: ${BASE_URL}`);
    console.log('=' * 50);
    
    const browser = await chromium.launch({ headless: false });
    const page = await browser.newPage();
    
    try {
        console.log('\n1. Testing basic page access...');
        const response = await page.goto(BASE_URL, { waitUntil: 'domcontentloaded', timeout: 30000 });
        
        console.log(`   Status Code: ${response.status()}`);
        console.log(`   URL After Redirect: ${page.url()}`);
        
        if (response.status() === 401 || response.status() === 403) {
            console.log('❌ CRITICAL ISSUE: Application requires authentication');
            console.log('📋 The cleanup version is not publicly accessible');
            
            // Check if we're being redirected to a login page
            const currentUrl = page.url();
            if (currentUrl.includes('login') || currentUrl.includes('auth')) {
                console.log('🔐 Redirected to login page - authentication required');
            }
            
            // Try to see what's on the page
            const pageTitle = await page.title();
            console.log(`   Page Title: ${pageTitle}`);
            
            const bodyText = await page.textContent('body').catch(() => 'Unable to read body text');
            console.log(`   Body Preview: ${bodyText.substring(0, 200)}...`);
            
        } else if (response.status() === 200) {
            console.log('✅ Page loads successfully');
            
            const pageTitle = await page.title();
            console.log(`   Page Title: ${pageTitle}`);
            
            // Check for key elements
            const hasHeading = await page.locator('h1, h2').count() > 0;
            const hasNavigation = await page.locator('nav, .nav').count() > 0;
            const hasContent = await page.locator('main, .main, .content').count() > 0;
            
            console.log(`   Has Heading: ${hasHeading}`);
            console.log(`   Has Navigation: ${hasNavigation}`);
            console.log(`   Has Main Content: ${hasContent}`);
            
        } else {
            console.log(`❌ Unexpected status code: ${response.status()}`);
        }
        
        // Check console errors
        const errors = [];
        page.on('console', msg => {
            if (msg.type() === 'error') {
                errors.push(msg.text());
            }
        });
        
        await page.waitForTimeout(3000); // Wait a bit for any console errors
        
        if (errors.length > 0) {
            console.log('\n🚨 Console Errors Found:');
            errors.slice(0, 5).forEach(error => console.log(`   - ${error}`));
            if (errors.length > 5) {
                console.log(`   ... and ${errors.length - 5} more errors`);
            }
        } else {
            console.log('\n✅ No console errors detected');
        }
        
    } catch (error) {
        console.log(`❌ Test failed: ${error.message}`);
    } finally {
        await browser.close();
    }
    
    console.log('\n' + '=' * 50);
    console.log('📋 RECOMMENDATION:');
    console.log('If authentication is required, we need to:');
    console.log('1. Check if this is expected behavior');
    console.log('2. Get proper credentials for testing');
    console.log('3. Or test against a public/demo version');
}

quickAccessibilityTest().catch(console.error);