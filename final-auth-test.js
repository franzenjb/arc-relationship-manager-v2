const { chromium } = require('playwright');

async function testAuthBypass() {
    const browser = await chromium.launch({ headless: false });
    const page = await browser.newPage();
    
    console.log('🔐 Testing authentication bypass for executive demo...');
    
    try {
        // Try to access a protected page directly
        await page.goto('https://arc-relationship-manager.vercel.app/organizations', { waitUntil: 'networkidle' });
        
        const currentUrl = page.url();
        const hasData = await page.evaluate(() => {
            return document.querySelectorAll('.organization, .org-card, tbody tr').length > 0;
        });
        
        console.log(`Current URL: ${currentUrl}`);
        console.log(`Has organization data: ${hasData}`);
        
        if (currentUrl.includes('/organizations') && hasData) {
            console.log('✅ Authentication bypass working - direct access to data successful');
        } else if (currentUrl.includes('signin') || currentUrl.includes('auth')) {
            console.log('⚠️  Authentication required - may need login for demo');
        } else {
            console.log('📍 Page loaded but checking data availability...');
        }
        
        // Test navigation to other key pages
        const testPages = ['/people', '/meetings', '/map', '/search'];
        for (const testPage of testPages) {
            await page.goto(`https://arc-relationship-manager.vercel.app${testPage}`, { waitUntil: 'networkidle' });
            const url = page.url();
            const hasContent = await page.evaluate(() => document.body.textContent.length > 300);
            console.log(`${testPage}: ${url.includes(testPage) && hasContent ? '✅ Accessible' : '⚠️ Issues'}`);
        }
        
    } catch (error) {
        console.error('❌ Auth test error:', error);
    } finally {
        await browser.close();
    }
}

testAuthBypass();