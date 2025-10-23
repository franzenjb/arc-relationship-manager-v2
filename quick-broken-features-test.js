const { chromium } = require('playwright');

async function quickBrokenFeaturesTest() {
    const browser = await chromium.launch({ headless: false });
    const page = await browser.newPage();
    
    const baseUrl = 'https://arc-relationship-manager.vercel.app';
    
    console.log('🚨 QUICK TEST OF BROKEN FEATURES\n');
    
    try {
        // 1. Check if Edit Meeting loads attendees
        console.log('1️⃣ Testing Edit Meeting...');
        await page.goto(`${baseUrl}/meetings`, { waitUntil: 'networkidle', timeout: 15000 });
        
        const meetingRows = await page.$$('tr');
        if (meetingRows.length > 1) {
            // Click first meeting to view details
            await meetingRows[1].click();
            await page.waitForTimeout(2000);
            
            // Check if edit button exists
            const editButton = await page.$('a:has-text("Edit")');
            if (editButton) {
                await editButton.click();
                await page.waitForTimeout(3000);
                console.log('✅ Edit page loads');
                
                // Check what's on the edit form
                const formElements = await page.evaluate(() => {
                    return {
                        hasDateInput: document.querySelector('input[type="date"]') !== null,
                        hasTextarea: document.querySelector('textarea') !== null,
                        hasAttendeeSection: document.body.textContent.includes('Attendee') || 
                                          document.body.textContent.includes('attendee'),
                        url: window.location.href
                    };
                });
                
                console.log('  Form elements:', formElements);
                if (!formElements.hasAttendeeSection) {
                    console.log('❌ MISSING: Attendee section in edit form!');
                }
            }
        }
        
        // 2. Check Profile page
        console.log('\n2️⃣ Testing Profile page...');
        await page.goto(`${baseUrl}/profile`, { waitUntil: 'networkidle', timeout: 15000 });
        await page.waitForTimeout(2000);
        
        const profileContent = await page.evaluate(() => {
            return {
                pageText: document.body.textContent,
                hasPasswordField: document.querySelector('input[type="password"]') !== null,
                hasEmailField: document.querySelector('input[type="email"]') !== null,
                hasSaveButton: document.querySelector('button[type="submit"]') !== null
            };
        });
        
        console.log('  Profile page:', profileContent.hasPasswordField ? '✅ Has forms' : '❌ Missing forms');
        
        // 3. Check Admin page
        console.log('\n3️⃣ Testing Admin page...');
        await page.goto(`${baseUrl}/admin`, { waitUntil: 'networkidle', timeout: 15000 });
        await page.waitForTimeout(2000);
        
        const adminContent = await page.evaluate(() => {
            return {
                hasAdminContent: document.body.textContent.includes('Admin') || 
                                document.body.textContent.includes('administration'),
                hasDataTables: document.querySelectorAll('table').length,
                hasAddButtons: document.querySelectorAll('button:not([disabled])').length,
                pageText: document.body.textContent.substring(0, 200)
            };
        });
        
        console.log('  Admin page:');
        console.log('    Tables:', adminContent.hasDataTables);
        console.log('    Buttons:', adminContent.hasAddButtons);
        console.log('    Content preview:', adminContent.pageText);
        
        // 4. Check Activity page
        console.log('\n4️⃣ Testing Activity page...');
        await page.goto(`${baseUrl}/activity`, { waitUntil: 'networkidle', timeout: 15000 });
        await page.waitForTimeout(2000);
        
        const activityContent = await page.evaluate(() => {
            const items = document.querySelectorAll('.border-l-4, [class*="activity"]');
            return {
                itemCount: items.length,
                hasContent: document.body.textContent.length > 500,
                hasNoActivity: document.body.textContent.includes('No activity') || 
                              document.body.textContent.includes('No recent')
            };
        });
        
        console.log('  Activity page:');
        console.log('    Items:', activityContent.itemCount);
        console.log('    Has content:', activityContent.hasContent);
        console.log('    Empty message:', activityContent.hasNoActivity);
        
        // 5. Check Search page functionality
        console.log('\n5️⃣ Testing Search page...');
        await page.goto(`${baseUrl}/search`, { waitUntil: 'networkidle', timeout: 15000 });
        await page.waitForTimeout(2000);
        
        // Check if search button is disabled without input
        const searchButtonInitial = await page.evaluate(() => {
            const btn = document.querySelector('button:has-text("Search"), button[type="submit"]');
            return btn ? btn.disabled : null;
        });
        
        console.log('  Search button initially:', searchButtonInitial ? '❌ Disabled' : '✅ Enabled');
        
        // Try to search with text
        await page.fill('input[type="text"]', 'test');
        await page.waitForTimeout(1000);
        
        const searchButtonAfter = await page.evaluate(() => {
            const btn = document.querySelector('button:has-text("Search"), button[type="submit"]');
            return btn ? btn.disabled : null;
        });
        
        console.log('  Search button with text:', searchButtonAfter ? '❌ Still disabled' : '✅ Enabled');
        
        // 6. Check People form validation
        console.log('\n6️⃣ Testing People creation...');
        await page.goto(`${baseUrl}/people/new`, { waitUntil: 'networkidle', timeout: 15000 });
        await page.waitForTimeout(2000);
        
        const peopleForm = await page.evaluate(() => {
            return {
                hasFirstName: document.querySelector('input[placeholder*="first" i], input[placeholder*="First" i]') !== null,
                hasLastName: document.querySelector('input[placeholder*="last" i], input[placeholder*="Last" i]') !== null,
                hasEmail: document.querySelector('input[type="email"], input[placeholder*="email" i]') !== null,
                hasOrgSelect: document.querySelector('select') !== null,
                formExists: document.querySelector('form') !== null
            };
        });
        
        console.log('  People form:');
        Object.entries(peopleForm).forEach(([key, value]) => {
            console.log(`    ${key}: ${value ? '✅' : '❌'}`);
        });
        
        // 7. Check Organization deletion cascade
        console.log('\n7️⃣ Testing Organization details...');
        await page.goto(`${baseUrl}/organizations`, { waitUntil: 'networkidle', timeout: 15000 });
        
        const orgRows = await page.$$('tr');
        if (orgRows.length > 1) {
            await orgRows[1].click();
            await page.waitForTimeout(2000);
            
            const orgDetails = await page.evaluate(() => {
                return {
                    hasDeleteButton: document.querySelector('button:has-text("Delete")') !== null,
                    hasPeopleSection: document.body.textContent.includes('People') || 
                                     document.body.textContent.includes('Contacts'),
                    hasMeetingsSection: document.body.textContent.includes('Meeting') || 
                                       document.body.textContent.includes('Interaction')
                };
            });
            
            console.log('  Organization details:');
            console.log('    Delete button:', orgDetails.hasDeleteButton ? '✅' : '❌ Missing');
            console.log('    People section:', orgDetails.hasPeopleSection ? '✅' : '❌');
            console.log('    Meetings section:', orgDetails.hasMeetingsSection ? '✅' : '❌');
        }
        
    } catch (error) {
        console.error('Test error:', error.message);
    } finally {
        console.log('\n🔍 SUMMARY OF BROKEN/MISSING FEATURES:');
        console.log('1. Edit Meeting - Missing attendee selection');
        console.log('2. Profile page - Needs password/email change implementation');
        console.log('3. Admin page - Using mock data, needs real database integration');
        console.log('4. Activity page - May be empty or missing pagination');
        console.log('5. Search - Button may be incorrectly disabled');
        console.log('6. People - Form validation unclear on requirements');
        console.log('7. Delete cascade - Need to verify orphaned data handling');
        
        await browser.close();
    }
}

quickBrokenFeaturesTest();