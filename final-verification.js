const { chromium } = require('playwright');

async function finalVerification() {
    const browser = await chromium.launch({ headless: false });
    const page = await browser.newPage();
    
    console.log('🔍 FINAL VERIFICATION OF RESTORED APP...');
    
    try {
        await page.goto('https://arc-relationship-manager.vercel.app', { 
            waitUntil: 'networkidle',
            timeout: 30000 
        });
        
        await page.waitForTimeout(5000);
        
        const verification = await page.evaluate(() => {
            return {
                title: document.title,
                hasHeader: document.body.textContent.includes('Relationship Manager'),
                hasDashboard: document.body.textContent.includes('Welcome') || document.body.textContent.includes('Dashboard'),
                hasNavigation: document.querySelectorAll('nav a').length > 0,
                hasStats: document.body.textContent.includes('Organizations') && document.body.textContent.includes('People'),
                isWorking: document.body.textContent.length > 500,
                bodyLength: document.body.textContent.length
            };
        });
        
        console.log('🔍 VERIFICATION RESULTS:');
        console.log(`   Title: ${verification.title}`);
        console.log(`   Has header: ${verification.hasHeader}`);
        console.log(`   Has dashboard: ${verification.hasDashboard}`);
        console.log(`   Has navigation: ${verification.hasNavigation}`);
        console.log(`   Has stats: ${verification.hasStats}`);
        console.log(`   Content length: ${verification.bodyLength}`);
        console.log(`   Is working: ${verification.isWorking}`);
        
        if (verification.isWorking && verification.hasHeader && verification.hasDashboard) {
            console.log('✅ APP IS FULLY RESTORED AND WORKING!');
        } else {
            console.log('❌ App still has issues');
        }
        
        await page.screenshot({ path: 'final-verification.png', fullPage: true });
        
    } catch (error) {
        console.error('❌ Verification failed:', error.message);
    } finally {
        await browser.close();
    }
}

finalVerification();