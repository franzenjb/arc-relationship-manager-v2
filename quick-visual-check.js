const { chromium } = require('playwright');

async function quickVisualCheck() {
    const browser = await chromium.launch({ headless: false });
    const page = await browser.newPage();
    
    console.log('📸 Taking screenshots of key pages for visual verification...');
    
    try {
        // Homepage
        await page.goto('https://arc-relationship-manager.vercel.app', { waitUntil: 'networkidle' });
        await page.screenshot({ path: 'homepage-screenshot.png', fullPage: true });
        console.log('✅ Homepage screenshot saved');
        
        // Organizations page
        await page.goto('https://arc-relationship-manager.vercel.app/organizations', { waitUntil: 'networkidle' });
        await page.screenshot({ path: 'organizations-screenshot.png', fullPage: true });
        console.log('✅ Organizations page screenshot saved');
        
        // Check the meetings new form specifically
        await page.goto('https://arc-relationship-manager.vercel.app/meetings/new', { waitUntil: 'networkidle' });
        await page.screenshot({ path: 'meetings-new-form-screenshot.png', fullPage: true });
        console.log('✅ Meetings new form screenshot saved');
        
        // Quick check of what inputs are available on meetings form
        const inputs = await page.evaluate(() => {
            const allInputs = Array.from(document.querySelectorAll('input, textarea, select'));
            return allInputs.map(input => ({
                type: input.type,
                name: input.name,
                placeholder: input.placeholder,
                id: input.id,
                tagName: input.tagName
            }));
        });
        
        console.log('📝 Available form inputs on meetings/new:');
        inputs.forEach((input, i) => {
            console.log(`  ${i + 1}. ${input.tagName} - type: ${input.type || 'text'}, name: ${input.name || 'none'}, placeholder: ${input.placeholder || 'none'}, id: ${input.id || 'none'}`);
        });
        
        // Also check page content
        const pageText = await page.evaluate(() => {
            return {
                title: document.title,
                headings: Array.from(document.querySelectorAll('h1, h2, h3')).map(h => h.textContent.trim()),
                hasForm: document.querySelector('form') ? true : false,
                formElements: document.querySelectorAll('form input, form textarea, form select').length
            };
        });
        
        console.log('📄 Page details:', pageText);
        
    } catch (error) {
        console.error('Error during visual check:', error);
    } finally {
        await browser.close();
    }
}

quickVisualCheck();