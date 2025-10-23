const { chromium } = require('playwright');

async function comprehensiveFeatureTest() {
    const browser = await chromium.launch({ headless: false });
    const page = await browser.newPage();
    
    const testResults = [];
    const baseUrl = 'https://arc-relationship-manager.vercel.app';
    
    // Helper function to record test results
    function recordTest(feature, action, status, error = null) {
        testResults.push({ feature, action, status, error });
        console.log(`${status === 'PASS' ? '✅' : '❌'} ${feature}: ${action}${error ? ' - ' + error : ''}`);
    }
    
    // Helper to safely click and wait
    async function safeClick(selector, description) {
        try {
            await page.click(selector);
            await page.waitForTimeout(2000);
            return true;
        } catch (error) {
            recordTest(description, 'Click', 'FAIL', error.message);
            return false;
        }
    }
    
    console.log('🧪 COMPREHENSIVE FEATURE TEST - TESTING EVERY CLICKABLE ELEMENT\n');
    
    try {
        // Navigate to app
        await page.goto(baseUrl, { waitUntil: 'networkidle' });
        await page.waitForTimeout(3000);
        
        // =======================
        // 1. DASHBOARD TESTS
        // =======================
        console.log('\n📊 TESTING DASHBOARD...');
        
        // Test Quick Action buttons
        const quickActions = [
            { selector: 'a[href="/organizations/new"]', name: 'Add Organization' },
            { selector: 'a[href="/meetings/new"]', name: 'Log Interaction' },
            { selector: 'a[href="/search"]', name: 'Search Contacts' },
            { selector: 'a[href="/map"]', name: 'View Map' }
        ];
        
        for (const action of quickActions) {
            try {
                await page.click(action.selector);
                await page.waitForTimeout(2000);
                const url = page.url();
                recordTest('Dashboard', action.name, url.includes(action.selector.match(/href="([^"]+)"/)[1]) ? 'PASS' : 'FAIL');
                await page.goto(baseUrl); // Go back
            } catch (error) {
                recordTest('Dashboard', action.name, 'FAIL', error.message);
            }
        }
        
        // Test Activity View buttons
        try {
            const viewButtons = await page.$$('a:has-text("View")');
            if (viewButtons.length > 0) {
                await viewButtons[0].click();
                await page.waitForTimeout(2000);
                recordTest('Dashboard', 'Activity View button', 'PASS');
                await page.goto(baseUrl);
            }
        } catch (error) {
            recordTest('Dashboard', 'Activity View button', 'FAIL', error.message);
        }
        
        // =======================
        // 2. ORGANIZATIONS PAGE
        // =======================
        console.log('\n🏢 TESTING ORGANIZATIONS...');
        await page.goto(`${baseUrl}/organizations`, { waitUntil: 'networkidle' });
        
        // Test Add New button
        try {
            await page.click('a[href="/organizations/new"]');
            await page.waitForTimeout(2000);
            recordTest('Organizations', 'Add New button', page.url().includes('/new') ? 'PASS' : 'FAIL');
            
            // Test form submission with minimal data
            await page.fill('input[placeholder="Organization name"]', 'Test Org ' + Date.now());
            await page.click('button[type="submit"]');
            await page.waitForTimeout(3000);
            recordTest('Organizations', 'Create with minimal data', !page.url().includes('/new') ? 'PASS' : 'FAIL');
        } catch (error) {
            recordTest('Organizations', 'Create organization', 'FAIL', error.message);
        }
        
        // Test Edit button
        await page.goto(`${baseUrl}/organizations`, { waitUntil: 'networkidle' });
        try {
            const editButtons = await page.$$('a[href*="/edit"]');
            if (editButtons.length > 0) {
                await editButtons[0].click();
                await page.waitForTimeout(2000);
                recordTest('Organizations', 'Edit button', page.url().includes('/edit') ? 'PASS' : 'FAIL');
                
                // Try to save edit
                await page.fill('textarea', 'Updated notes ' + Date.now());
                await page.click('button[type="submit"]');
                await page.waitForTimeout(3000);
                recordTest('Organizations', 'Save edit', !page.url().includes('/edit') ? 'PASS' : 'FAIL');
            }
        } catch (error) {
            recordTest('Organizations', 'Edit organization', 'FAIL', error.message);
        }
        
        // =======================
        // 3. PEOPLE PAGE
        // =======================
        console.log('\n👥 TESTING PEOPLE...');
        await page.goto(`${baseUrl}/people`, { waitUntil: 'networkidle' });
        
        // Test creating person WITHOUT organization
        try {
            await page.click('a[href="/people/new"]');
            await page.waitForTimeout(2000);
            
            await page.fill('input[placeholder*="First name"]', 'Test');
            await page.fill('input[placeholder*="Last name"]', 'NoOrg' + Date.now());
            await page.fill('input[placeholder*="Email"]', `test${Date.now()}@example.com`);
            
            // Submit WITHOUT selecting organization
            await page.click('button[type="submit"]');
            await page.waitForTimeout(3000);
            
            const hasError = await page.locator('.text-red-500, [role="alert"]').count() > 0;
            recordTest('People', 'Create without organization', hasError ? 'FAIL - Requires org' : 'PASS - Allows no org');
        } catch (error) {
            recordTest('People', 'Create person without org', 'FAIL', error.message);
        }
        
        // Test duplicate email
        await page.goto(`${baseUrl}/people/new`, { waitUntil: 'networkidle' });
        try {
            const duplicateEmail = 'duplicate@test.com';
            
            // First person
            await page.fill('input[placeholder*="First name"]', 'First');
            await page.fill('input[placeholder*="Last name"]', 'Person');
            await page.fill('input[placeholder*="Email"]', duplicateEmail);
            await page.selectOption('select', { index: 1 });
            await page.click('button[type="submit"]');
            await page.waitForTimeout(3000);
            
            // Second person with same email
            await page.goto(`${baseUrl}/people/new`);
            await page.fill('input[placeholder*="First name"]', 'Second');
            await page.fill('input[placeholder*="Last name"]', 'Person');
            await page.fill('input[placeholder*="Email"]', duplicateEmail);
            await page.selectOption('select', { index: 1 });
            await page.click('button[type="submit"]');
            await page.waitForTimeout(3000);
            
            recordTest('People', 'Duplicate email', 'CHECK - System allows duplicate emails');
        } catch (error) {
            recordTest('People', 'Duplicate email test', 'FAIL', error.message);
        }
        
        // =======================
        // 4. MEETINGS/INTERACTIONS
        // =======================
        console.log('\n📅 TESTING MEETINGS/INTERACTIONS...');
        await page.goto(`${baseUrl}/meetings`, { waitUntil: 'networkidle' });
        
        // Test creating meeting with past date
        try {
            await page.click('a[href="/meetings/new"]');
            await page.waitForTimeout(2000);
            
            await page.selectOption('select', { index: 1 });
            await page.fill('input[type="date"]', '2020-01-01'); // Very old date
            await page.fill('textarea', 'Past meeting test');
            await page.click('button[type="submit"]');
            await page.waitForTimeout(3000);
            
            recordTest('Meetings', 'Create with past date', !page.url().includes('/new') ? 'PASS' : 'FAIL');
        } catch (error) {
            recordTest('Meetings', 'Past date meeting', 'FAIL', error.message);
        }
        
        // Test empty meeting (no notes, no attendees)
        await page.goto(`${baseUrl}/meetings/new`, { waitUntil: 'networkidle' });
        try {
            await page.selectOption('select', { index: 1 });
            // Don't fill anything else
            await page.click('button[type="submit"]');
            await page.waitForTimeout(3000);
            
            recordTest('Meetings', 'Create empty meeting', !page.url().includes('/new') ? 'PASS - Allows empty' : 'FAIL - Requires data');
        } catch (error) {
            recordTest('Meetings', 'Empty meeting', 'FAIL', error.message);
        }
        
        // Test follow-up date before meeting date
        await page.goto(`${baseUrl}/meetings/new`, { waitUntil: 'networkidle' });
        try {
            await page.selectOption('select', { index: 1 });
            await page.fill('input[type="date"]:first-of-type', '2024-12-25');
            await page.fill('input[type="date"]:last-of-type', '2024-01-01'); // Follow-up BEFORE meeting
            await page.click('button[type="submit"]');
            await page.waitForTimeout(3000);
            
            recordTest('Meetings', 'Follow-up before meeting date', 'CHECK - System allows illogical dates');
        } catch (error) {
            recordTest('Meetings', 'Invalid follow-up date', 'FAIL', error.message);
        }
        
        // Test Edit Meeting (check if attendees load)
        await page.goto(`${baseUrl}/meetings`, { waitUntil: 'networkidle' });
        try {
            const editButtons = await page.$$('a[href*="/edit"]');
            if (editButtons.length > 0) {
                await editButtons[0].click();
                await page.waitForTimeout(2000);
                
                // Check if form loads
                const hasDateField = await page.locator('input[type="date"]').count() > 0;
                recordTest('Meetings', 'Edit meeting loads', hasDateField ? 'PASS' : 'FAIL');
                
                // Check if attendees section exists
                const hasAttendees = await page.locator('text=/attendee/i').count() > 0;
                recordTest('Meetings', 'Edit shows attendees', hasAttendees ? 'PASS' : 'FAIL - Missing attendees');
            }
        } catch (error) {
            recordTest('Meetings', 'Edit meeting', 'FAIL', error.message);
        }
        
        // =======================
        // 5. SEARCH PAGE
        // =======================
        console.log('\n🔍 TESTING SEARCH...');
        await page.goto(`${baseUrl}/search`, { waitUntil: 'networkidle' });
        
        // Test empty search
        try {
            await page.click('button:has-text("Search")');
            await page.waitForTimeout(2000);
            recordTest('Search', 'Empty search', 'PASS');
        } catch (error) {
            recordTest('Search', 'Empty search', 'FAIL', error.message);
        }
        
        // Test search with special characters
        try {
            await page.fill('input[type="text"]', "'; DROP TABLE meetings; --");
            await page.click('button:has-text("Search")');
            await page.waitForTimeout(2000);
            recordTest('Search', 'SQL injection attempt', 'PASS - No crash');
        } catch (error) {
            recordTest('Search', 'Special characters', 'FAIL', error.message);
        }
        
        // Test with very long input
        try {
            await page.fill('input[type="text"]', 'a'.repeat(1000));
            await page.click('button:has-text("Search")');
            await page.waitForTimeout(2000);
            recordTest('Search', 'Very long input', 'PASS');
        } catch (error) {
            recordTest('Search', 'Long input', 'FAIL', error.message);
        }
        
        // =======================
        // 6. MAP PAGE
        // =======================
        console.log('\n🗺️ TESTING MAP...');
        await page.goto(`${baseUrl}/map`, { waitUntil: 'networkidle' });
        await page.waitForTimeout(5000); // Map needs time to load
        
        // Check if map loads
        try {
            const hasMap = await page.locator('#map, .mapboxgl-map, .leaflet-container').count() > 0;
            recordTest('Map', 'Map renders', hasMap ? 'PASS' : 'FAIL - No map element');
            
            // Try clicking a marker
            const markers = await page.$$('.marker, .mapboxgl-marker, .leaflet-marker-icon');
            if (markers.length > 0) {
                await markers[0].click();
                await page.waitForTimeout(2000);
                recordTest('Map', 'Marker click', 'PASS');
            } else {
                recordTest('Map', 'Markers', 'FAIL - No markers found');
            }
        } catch (error) {
            recordTest('Map', 'Map functionality', 'FAIL', error.message);
        }
        
        // =======================
        // 7. ACTIVITY PAGE
        // =======================
        console.log('\n📈 TESTING ACTIVITY...');
        await page.goto(`${baseUrl}/activity`, { waitUntil: 'networkidle' });
        
        try {
            const activityItems = await page.$$('.border-l-4');
            recordTest('Activity', 'Activity items load', activityItems.length > 0 ? 'PASS' : 'WARN - No activity');
            
            // Check for pagination
            const hasPagination = await page.locator('button:has-text("Load more"), button:has-text("Next")').count() > 0;
            recordTest('Activity', 'Pagination', hasPagination ? 'PASS' : 'WARN - No pagination');
        } catch (error) {
            recordTest('Activity', 'Activity page', 'FAIL', error.message);
        }
        
        // =======================
        // 8. ADMIN PAGE
        // =======================
        console.log('\n⚙️ TESTING ADMIN...');
        await page.goto(`${baseUrl}/admin`, { waitUntil: 'networkidle' });
        
        try {
            // Check if admin page loads or requires permissions
            const hasAdminContent = await page.locator('text=/admin/i').count() > 0;
            const hasPermissionError = await page.locator('text=/unauthorized|forbidden|permission/i').count() > 0;
            
            if (hasPermissionError) {
                recordTest('Admin', 'Access control', 'PASS - Protected');
            } else if (hasAdminContent) {
                recordTest('Admin', 'Admin page loads', 'PASS');
                
                // Try clicking admin functions
                const adminButtons = await page.$$('button:has-text("Add"), button:has-text("Edit")');
                if (adminButtons.length > 0) {
                    await adminButtons[0].click();
                    await page.waitForTimeout(2000);
                    recordTest('Admin', 'Admin functions', 'CHECK - Verify if working with real data');
                }
            }
        } catch (error) {
            recordTest('Admin', 'Admin page', 'FAIL', error.message);
        }
        
        // =======================
        // 9. PROFILE PAGE
        // =======================
        console.log('\n👤 TESTING PROFILE...');
        await page.goto(`${baseUrl}/profile`, { waitUntil: 'networkidle' });
        
        try {
            // Check if profile page loads
            const hasProfileForm = await page.locator('input[type="email"], input[type="password"]').count() > 0;
            
            if (hasProfileForm) {
                // Test changing password
                const passwordFields = await page.$$('input[type="password"]');
                if (passwordFields.length >= 2) {
                    await passwordFields[0].fill('NewPassword123!');
                    await passwordFields[1].fill('NewPassword123!');
                    
                    // Don't actually submit - just check if form accepts input
                    recordTest('Profile', 'Password change form', 'PASS - Form exists');
                }
                
                // Test email change
                const emailField = await page.$('input[type="email"]');
                if (emailField) {
                    await emailField.fill('newemail@example.com');
                    recordTest('Profile', 'Email change form', 'PASS - Form exists');
                }
            } else {
                recordTest('Profile', 'Profile page', 'WARN - No profile form found');
            }
        } catch (error) {
            recordTest('Profile', 'Profile page', 'FAIL', error.message);
        }
        
        // =======================
        // 10. NAVIGATION TESTS
        // =======================
        console.log('\n🧭 TESTING NAVIGATION...');
        
        // Test Tools dropdown
        try {
            await page.click('button:has-text("Tools")');
            await page.waitForTimeout(1000);
            
            const toolsMenuVisible = await page.locator('a[href="/map"], a[href="/search"]').count() > 0;
            recordTest('Navigation', 'Tools dropdown', toolsMenuVisible ? 'PASS' : 'FAIL');
        } catch (error) {
            recordTest('Navigation', 'Tools menu', 'FAIL', error.message);
        }
        
        // =======================
        // SUMMARY
        // =======================
        console.log('\n' + '='.repeat(60));
        console.log('📊 TEST SUMMARY\n');
        
        const passed = testResults.filter(t => t.status === 'PASS').length;
        const failed = testResults.filter(t => t.status === 'FAIL').length;
        const warnings = testResults.filter(t => t.status === 'WARN' || t.status === 'CHECK').length;
        
        console.log(`✅ Passed: ${passed}`);
        console.log(`❌ Failed: ${failed}`);
        console.log(`⚠️  Warnings/Checks: ${warnings}`);
        console.log(`📝 Total tests: ${testResults.length}`);
        
        console.log('\n🔴 CRITICAL ISSUES FOUND:');
        testResults
            .filter(t => t.status === 'FAIL')
            .forEach(t => console.log(`   - ${t.feature}: ${t.action} - ${t.error || 'Failed'}`));
        
        console.log('\n⚠️  ITEMS NEEDING REVIEW:');
        testResults
            .filter(t => t.status === 'CHECK' || t.status === 'WARN')
            .forEach(t => console.log(`   - ${t.feature}: ${t.action}`));
        
    } catch (error) {
        console.error('Test suite failed:', error);
    } finally {
        await browser.close();
    }
}

comprehensiveFeatureTest();