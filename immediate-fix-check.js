const { chromium } = require('playwright');

async function immediateCheck() {
    const browser = await chromium.launch({ headless: false });
    const page = await browser.newPage();
    
    console.log('🚨 IMMEDIATE CHECK OF CURRENT APP STATE...');
    
    try {
        await page.goto('https://arc-relationship-manager.vercel.app', { 
            waitUntil: 'domcontentloaded',
            timeout: 15000 
        });
        
        await page.waitForTimeout(3000);
        
        const status = await page.evaluate(() => {
            return {
                title: document.title,
                hasContent: document.body && document.body.textContent.length > 10,
                bodyText: document.body ? document.body.textContent.substring(0, 100) : 'NO BODY',
                isBlank: !document.body || document.body.textContent.trim().length < 10
            };
        });
        
        console.log('Current status:');
        console.log(`  Title: "${status.title}"`);
        console.log(`  Has content: ${status.hasContent}`);
        console.log(`  Is blank: ${status.isBlank}`);
        console.log(`  Body text: "${status.bodyText}"`);
        
        if (status.isBlank || !status.hasContent) {
            console.log('❌ APP IS BROKEN - BLANK SCREEN');
        } else {
            console.log('✅ APP HAS CONTENT');
        }
        
    } catch (error) {
        console.error('❌ APP COMPLETELY BROKEN:', error.message);
    } finally {
        await browser.close();
    }
}

immediateCheck();