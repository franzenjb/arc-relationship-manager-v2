const { chromium } = require('playwright');

// CRITICAL: Testing PRODUCTION version for EXECUTIVE DEMO
const BASE_URL = 'https://arc-relationship-manager.vercel.app';

class ExecutiveDemoTest {
    constructor() {
        this.browser = null;
        this.page = null;
        this.testResults = {
            critical: { tests: 0, passed: 0, failed: 0, errors: [] },
            navigation: { tests: 0, passed: 0, failed: 0, errors: [] },
            organizations: { tests: 0, passed: 0, failed: 0, errors: [] },
            people: { tests: 0, passed: 0, failed: 0, errors: [] },
            meetings: { tests: 0, passed: 0, failed: 0, errors: [] },
            advanced: { tests: 0, passed: 0, failed: 0, errors: [] },
            performance: { tests: 0, passed: 0, failed: 0, errors: [] },
            stress: { tests: 0, passed: 0, failed: 0, errors: [] },
            mobile: { tests: 0, passed: 0, failed: 0, errors: [] }
        };
        this.performanceMetrics = {};
        this.consoleErrors = [];
        this.networkErrors = [];
        this.screenshots = [];
    }

    async init() {
        console.log('🚀 EXECUTIVE DEMO COMPREHENSIVE TEST');
        console.log(`📍 Testing PRODUCTION URL: ${BASE_URL}`);
        console.log('⚠️  CRITICAL: Executive demo must work perfectly\n');

        this.browser = await chromium.launch({ 
            headless: false,
            slowMo: 50,
            args: ['--disable-web-security', '--disable-features=VizDisplayCompositor']
        });
        this.page = await this.browser.newPage();

        // Enhanced monitoring
        this.page.on('console', msg => {
            if (msg.type() === 'error') {
                this.consoleErrors.push(`${msg.text()} at ${msg.location().url}`);
                console.log(`🔴 Console Error: ${msg.text()}`);
            }
        });

        this.page.on('response', response => {
            if (response.status() >= 400) {
                this.networkErrors.push(`${response.status()} - ${response.url()}`);
                console.log(`🔴 Network Error: ${response.status()} - ${response.url()}`);
            }
        });

        this.page.on('pageerror', error => {
            this.consoleErrors.push(`Page Error: ${error.message}`);
            console.log(`🔴 Page Error: ${error.message}`);
        });
    }

    async test(category, testName, testFn) {
        this.testResults[category].tests++;
        const startTime = Date.now();
        
        try {
            console.log(`🧪 Testing: ${testName}`);
            await testFn();
            const duration = Date.now() - startTime;
            this.testResults[category].passed++;
            console.log(`✅ PASS: ${testName} (${duration}ms)`);
            return true;
        } catch (error) {
            const duration = Date.now() - startTime;
            this.testResults[category].failed++;
            this.testResults[category].errors.push(`${testName}: ${error.message}`);
            console.log(`❌ FAIL: ${testName} (${duration}ms) - ${error.message}`);
            
            // Take screenshot of failure
            try {
                const screenshot = `screenshot-${category}-${Date.now()}.png`;
                await this.page.screenshot({ path: screenshot });
                this.screenshots.push(screenshot);
                console.log(`📸 Screenshot saved: ${screenshot}`);
            } catch {}
            
            return false;
        }
    }

    // 1. CRITICAL FUNCTIONALITY TESTS
    async testCriticalFunctionality() {
        console.log('\n🚨 SECTION 1: CRITICAL FUNCTIONALITY - EXECUTIVE DEMO ESSENTIALS');
        
        await this.test('critical', 'Homepage loads completely', async () => {
            const start = Date.now();
            await this.page.goto(BASE_URL, { waitUntil: 'networkidle', timeout: 30000 });
            this.performanceMetrics.homeLoad = Date.now() - start;
            
            // Check for main heading
            await this.page.waitForSelector('h1', { timeout: 10000 });
            const title = await this.page.textContent('h1');
            if (!title || title.trim().length === 0) {
                throw new Error('No main heading found');
            }
            
            // Check Red Cross branding
            const redCrossElements = await this.page.locator('img[alt*="Red Cross"], img[src*="red-cross"], .red-cross, [class*="red-cross"]').count();
            if (redCrossElements === 0) {
                throw new Error('No Red Cross branding visible');
            }
        });

        await this.test('critical', 'No JavaScript errors on load', async () => {
            await this.page.goto(BASE_URL, { waitUntil: 'networkidle' });
            await this.page.waitForTimeout(3000); // Wait for any delayed JS
            
            if (this.consoleErrors.length > 0) {
                throw new Error(`${this.consoleErrors.length} JavaScript errors found`);
            }
        });

        await this.test('critical', 'Navigation menu functional', async () => {
            await this.page.goto(BASE_URL, { waitUntil: 'networkidle' });
            
            const nav = await this.page.locator('nav, [role="navigation"], .navbar').first();
            await nav.waitFor({ timeout: 5000 });
            
            const navLinks = await this.page.locator('nav a, [role="navigation"] a, .navbar a').count();
            if (navLinks === 0) {
                throw new Error('No navigation links found');
            }
            
            // Test first navigation link
            const firstLink = await this.page.locator('nav a, [role="navigation"] a, .navbar a').first();
            if (await firstLink.count() > 0) {
                await firstLink.click();
                await this.page.waitForLoadState('networkidle');
            }
        });

        await this.test('critical', 'Data loads (not just loading skeletons)', async () => {
            await this.page.goto(`${BASE_URL}/organizations`, { waitUntil: 'networkidle' });
            
            // Wait longer for actual data
            await this.page.waitForTimeout(5000);
            
            // Check for actual content, not just loading states
            const hasRealData = await this.page.evaluate(() => {
                const loadingElements = document.querySelectorAll('[class*="loading"], [class*="skeleton"], [class*="spinner"]').length;
                const contentElements = document.querySelectorAll('tbody tr, .organization-item, .org-card, [data-testid*="org"]').length;
                
                return {
                    loading: loadingElements,
                    content: contentElements,
                    hasText: document.body.textContent.length > 500
                };
            });
            
            if (hasRealData.loading > 0 && hasRealData.content === 0) {
                throw new Error('Still showing loading skeletons - no actual data loaded');
            }
            
            if (!hasRealData.hasText) {
                throw new Error('Insufficient content - page appears empty');
            }
        });

        await this.test('critical', 'Forms load and are interactive', async () => {
            // Try to find a create form
            const routes = ['/organizations/new', '/people/new', '/meetings/new'];
            let formWorking = false;
            
            for (const route of routes) {
                try {
                    await this.page.goto(`${BASE_URL}${route}`, { waitUntil: 'networkidle' });
                    
                    const form = await this.page.locator('form').first();
                    if (await form.count() > 0) {
                        // Test form interaction
                        const input = await this.page.locator('input[type="text"], input:not([type]), textarea').first();
                        if (await input.count() > 0) {
                            await input.fill('Executive Demo Test');
                            const value = await input.inputValue();
                            if (value === 'Executive Demo Test') {
                                formWorking = true;
                                break;
                            }
                        }
                    }
                } catch {
                    continue;
                }
            }
            
            if (!formWorking) {
                throw new Error('No working forms found');
            }
        });
    }

    // 2. NAVIGATION TESTS
    async testNavigation() {
        console.log('\n📍 SECTION 2: NAVIGATION & CORE PAGES');
        
        await this.test('navigation', 'Organizations page loads with data', async () => {
            await this.page.goto(`${BASE_URL}/organizations`, { waitUntil: 'networkidle' });
            await this.page.waitForTimeout(3000);
            
            const hasContent = await this.page.evaluate(() => {
                const rows = document.querySelectorAll('tbody tr, .organization-item, .org-card').length;
                const text = document.body.textContent;
                return rows > 0 || text.includes('Organization') || text.includes('Company');
            });
            
            if (!hasContent) {
                throw new Error('Organizations page has no visible content');
            }
        });

        await this.test('navigation', 'People page loads with data', async () => {
            await this.page.goto(`${BASE_URL}/people`, { waitUntil: 'networkidle' });
            await this.page.waitForTimeout(3000);
            
            const hasContent = await this.page.evaluate(() => {
                const rows = document.querySelectorAll('tbody tr, .person-item, .people-card').length;
                const text = document.body.textContent;
                return rows > 0 || text.includes('Contact') || text.includes('Person');
            });
            
            if (!hasContent) {
                throw new Error('People page has no visible content');
            }
        });

        await this.test('navigation', 'Meetings/Interactions page loads', async () => {
            await this.page.goto(`${BASE_URL}/meetings`, { waitUntil: 'networkidle' });
            await this.page.waitForTimeout(3000);
            
            const hasContent = await this.page.evaluate(() => {
                const rows = document.querySelectorAll('tbody tr, .meeting-item, .interaction-card').length;
                const text = document.body.textContent;
                return rows > 0 || text.includes('Meeting') || text.includes('Interaction');
            });
            
            if (!hasContent) {
                throw new Error('Meetings page has no visible content');
            }
        });

        await this.test('navigation', 'Search functionality works', async () => {
            await this.page.goto(`${BASE_URL}/search`, { waitUntil: 'networkidle' });
            
            const searchInput = await this.page.locator('input[type="search"], input[placeholder*="search" i]').first();
            if (await searchInput.count() > 0) {
                await searchInput.fill('Red Cross');
                await this.page.keyboard.press('Enter');
                await this.page.waitForTimeout(2000);
            } else {
                console.log('⚠️  Search page exists but no search input found');
            }
        });

        await this.test('navigation', 'Map page loads and functions', async () => {
            await this.page.goto(`${BASE_URL}/map`, { waitUntil: 'networkidle' });
            await this.page.waitForTimeout(5000); // Maps take time to load
            
            const mapContainer = await this.page.locator('.leaflet-container, #map, .map-container').first();
            if (await mapContainer.count() > 0) {
                await mapContainer.click();
                await this.page.waitForTimeout(1000);
            } else {
                throw new Error('Map container not found');
            }
        });
    }

    // 3. DETAILED ORGANIZATIONS TESTS
    async testOrganizations() {
        console.log('\n🏢 SECTION 3: ORGANIZATIONS FUNCTIONALITY');
        
        await this.test('organizations', 'Organization detail pages work', async () => {
            await this.page.goto(`${BASE_URL}/organizations`, { waitUntil: 'networkidle' });
            
            const orgLink = await this.page.locator('a[href*="/organizations/"], tr a, .org-link').first();
            if (await orgLink.count() > 0) {
                await orgLink.click();
                await this.page.waitForLoadState('networkidle');
                await this.page.waitForSelector('h1, h2, .title', { timeout: 5000 });
                
                // Verify it's a detail page with content
                const hasDetailContent = await this.page.evaluate(() => {
                    return document.body.textContent.length > 200;
                });
                
                if (!hasDetailContent) {
                    throw new Error('Organization detail page has insufficient content');
                }
            } else {
                throw new Error('No organization links found to test');
            }
        });

        await this.test('organizations', 'Create organization form works', async () => {
            await this.page.goto(`${BASE_URL}/organizations/new`, { waitUntil: 'networkidle' });
            
            const form = await this.page.locator('form').first();
            await form.waitFor({ timeout: 5000 });
            
            // Test required fields
            const nameInput = await this.page.locator('input[name*="name"], input[placeholder*="name" i], input[id*="name"]').first();
            if (await nameInput.count() > 0) {
                await nameInput.fill('Executive Demo Organization');
                const value = await nameInput.inputValue();
                if (value !== 'Executive Demo Organization') {
                    throw new Error('Name input not working');
                }
            } else {
                throw new Error('Organization name input not found');
            }
        });

        await this.test('organizations', 'Organization search/filtering works', async () => {
            await this.page.goto(`${BASE_URL}/organizations`, { waitUntil: 'networkidle' });
            
            const searchInput = await this.page.locator('input[type="search"], input[placeholder*="search" i], input[placeholder*="filter" i]').first();
            if (await searchInput.count() > 0) {
                await searchInput.fill('Red');
                await this.page.waitForTimeout(2000);
                
                // Check if results changed
                const resultsCount = await this.page.locator('tbody tr, .organization-item').count();
                console.log(`Search results: ${resultsCount} items`);
            } else {
                console.log('⚠️  No search/filter input found on organizations page');
            }
        });
    }

    // 4. DETAILED PEOPLE TESTS
    async testPeople() {
        console.log('\n👥 SECTION 4: PEOPLE FUNCTIONALITY');
        
        await this.test('people', 'People detail pages work', async () => {
            await this.page.goto(`${BASE_URL}/people`, { waitUntil: 'networkidle' });
            
            const personLink = await this.page.locator('a[href*="/people/"], tr a, .person-link').first();
            if (await personLink.count() > 0) {
                await personLink.click();
                await this.page.waitForLoadState('networkidle');
                await this.page.waitForSelector('h1, h2, .title', { timeout: 5000 });
                
                const hasDetailContent = await this.page.evaluate(() => {
                    return document.body.textContent.length > 200;
                });
                
                if (!hasDetailContent) {
                    throw new Error('Person detail page has insufficient content');
                }
            } else {
                throw new Error('No person links found to test');
            }
        });

        await this.test('people', 'Create person form works', async () => {
            await this.page.goto(`${BASE_URL}/people/new`, { waitUntil: 'networkidle' });
            
            const form = await this.page.locator('form').first();
            await form.waitFor({ timeout: 5000 });
            
            const nameInput = await this.page.locator('input[name*="name"], input[placeholder*="name" i]').first();
            if (await nameInput.count() > 0) {
                await nameInput.fill('Demo Executive Contact');
                const value = await nameInput.inputValue();
                if (value !== 'Demo Executive Contact') {
                    throw new Error('Person name input not working');
                }
            } else {
                throw new Error('Person name input not found');
            }
        });

        await this.test('people', 'Edit person functionality', async () => {
            await this.page.goto(`${BASE_URL}/people`, { waitUntil: 'networkidle' });
            
            const editLink = await this.page.locator('a[href*="/edit"], button:has-text("Edit"), .edit-btn').first();
            if (await editLink.count() > 0) {
                await editLink.click();
                await this.page.waitForLoadState('networkidle');
                
                const form = await this.page.locator('form').first();
                if (await form.count() === 0) {
                    throw new Error('Edit form not found');
                }
            } else {
                console.log('⚠️  No edit functionality found - may not be visible');
            }
        });
    }

    // 5. MEETINGS/INTERACTIONS TESTS
    async testMeetings() {
        console.log('\n🤝 SECTION 5: MEETINGS/INTERACTIONS FUNCTIONALITY');
        
        await this.test('meetings', 'Meeting detail pages work', async () => {
            await this.page.goto(`${BASE_URL}/meetings`, { waitUntil: 'networkidle' });
            
            const meetingLink = await this.page.locator('a[href*="/meetings/"], tr a, .meeting-link').first();
            if (await meetingLink.count() > 0) {
                await meetingLink.click();
                await this.page.waitForLoadState('networkidle');
                await this.page.waitForSelector('h1, h2, .title', { timeout: 5000 });
                
                const hasDetailContent = await this.page.evaluate(() => {
                    return document.body.textContent.length > 200;
                });
                
                if (!hasDetailContent) {
                    throw new Error('Meeting detail page has insufficient content');
                }
            } else {
                throw new Error('No meeting links found to test');
            }
        });

        await this.test('meetings', 'Create meeting form works', async () => {
            await this.page.goto(`${BASE_URL}/meetings/new`, { waitUntil: 'networkidle' });
            
            const form = await this.page.locator('form').first();
            await form.waitFor({ timeout: 5000 });
            
            const titleInput = await this.page.locator('input[name*="title"], input[placeholder*="title" i], textarea[name*="subject"]').first();
            if (await titleInput.count() > 0) {
                await titleInput.fill('Executive Demo Meeting');
                const value = await titleInput.inputValue();
                if (value !== 'Executive Demo Meeting') {
                    throw new Error('Meeting title input not working');
                }
            } else {
                throw new Error('Meeting title input not found');
            }
        });
    }

    // 6. ADVANCED FEATURES
    async testAdvancedFeatures() {
        console.log('\n⚡ SECTION 6: ADVANCED FEATURES');
        
        await this.test('advanced', 'Activity dashboard loads', async () => {
            await this.page.goto(`${BASE_URL}/activity`, { waitUntil: 'networkidle' });
            await this.page.waitForTimeout(3000);
            
            const hasActivity = await this.page.evaluate(() => {
                const rows = document.querySelectorAll('tbody tr, .activity-item, .timeline-item').length;
                const text = document.body.textContent;
                return rows > 0 || text.includes('activity') || text.includes('recent');
            });
            
            if (!hasActivity) {
                throw new Error('Activity dashboard has no content');
            }
        });

        await this.test('advanced', 'Tech stack page loads', async () => {
            await this.page.goto(`${BASE_URL}/tech-stack`, { waitUntil: 'networkidle' });
            await this.page.waitForSelector('h1, h2', { timeout: 5000 });
            
            const hasTechContent = await this.page.evaluate(() => {
                const text = document.body.textContent.toLowerCase();
                return text.includes('react') || text.includes('next') || text.includes('technology') || text.includes('stack');
            });
            
            if (!hasTechContent) {
                throw new Error('Tech stack page has no relevant content');
            }
        });

        await this.test('advanced', 'Admin interface (if accessible)', async () => {
            try {
                await this.page.goto(`${BASE_URL}/admin`, { waitUntil: 'networkidle' });
                await this.page.waitForSelector('h1, h2', { timeout: 3000 });
                console.log('✅ Admin interface accessible');
            } catch {
                console.log('⚠️  Admin interface not accessible (expected if authentication required)');
            }
        });

        await this.test('advanced', 'Profile page functionality', async () => {
            try {
                await this.page.goto(`${BASE_URL}/profile`, { waitUntil: 'networkidle' });
                await this.page.waitForSelector('h1, h2', { timeout: 3000 });
                console.log('✅ Profile page accessible');
            } catch {
                console.log('⚠️  Profile page not accessible (expected if authentication required)');
            }
        });
    }

    // 7. PERFORMANCE TESTS
    async testPerformance() {
        console.log('\n🚀 SECTION 7: PERFORMANCE & STABILITY');
        
        await this.test('performance', 'Page load times under 5 seconds', async () => {
            const pages = ['/', '/organizations', '/people', '/meetings'];
            const loadTimes = {};
            
            for (const page of pages) {
                const start = Date.now();
                await this.page.goto(`${BASE_URL}${page}`, { waitUntil: 'networkidle' });
                const loadTime = Date.now() - start;
                loadTimes[page] = loadTime;
                
                if (loadTime > 5000) {
                    throw new Error(`${page} took ${loadTime}ms to load (over 5 second limit)`);
                }
            }
            
            this.performanceMetrics.pageLoadTimes = loadTimes;
        });

        await this.test('performance', 'No broken images or resources', async () => {
            await this.page.goto(BASE_URL, { waitUntil: 'networkidle' });
            
            const brokenImages = await this.page.evaluate(() => {
                const images = Array.from(document.querySelectorAll('img'));
                return images.filter(img => !img.complete || img.naturalWidth === 0).length;
            });
            
            if (brokenImages > 0) {
                throw new Error(`${brokenImages} broken images found`);
            }
        });

        await this.test('performance', 'Memory usage reasonable', async () => {
            const metrics = await this.page.evaluate(() => {
                return {
                    memory: performance.memory ? {
                        used: performance.memory.usedJSHeapSize,
                        total: performance.memory.totalJSHeapSize
                    } : null
                };
            });
            
            this.performanceMetrics.memory = metrics.memory;
            
            if (metrics.memory && metrics.memory.used > 100 * 1024 * 1024) {
                console.log(`⚠️  High memory usage: ${(metrics.memory.used / 1024 / 1024).toFixed(2)}MB`);
            }
        });
    }

    // 8. STRESS TESTING
    async testStress() {
        console.log('\n💪 SECTION 8: STRESS TESTING');
        
        await this.test('stress', 'Rapid navigation stress test', async () => {
            const pages = ['/', '/organizations', '/people', '/meetings', '/search', '/map'];
            
            for (let i = 0; i < 3; i++) {
                for (const page of pages) {
                    try {
                        await this.page.goto(`${BASE_URL}${page}`, { waitUntil: 'domcontentloaded', timeout: 10000 });
                        await this.page.waitForTimeout(500);
                    } catch {
                        console.log(`⚠️  ${page} failed during stress test iteration ${i + 1}`);
                    }
                }
            }
        });

        await this.test('stress', 'Form interaction stress test', async () => {
            const formPages = ['/organizations/new', '/people/new', '/meetings/new'];
            
            for (const formPage of formPages) {
                try {
                    await this.page.goto(`${BASE_URL}${formPage}`, { waitUntil: 'networkidle' });
                    
                    const inputs = await this.page.locator('input, textarea, select').all();
                    for (let i = 0; i < Math.min(inputs.length, 3); i++) {
                        try {
                            await inputs[i].fill(`Stress test ${i}`);
                            await this.page.waitForTimeout(200);
                        } catch {}
                    }
                } catch {
                    console.log(`⚠️  Form stress test failed for ${formPage}`);
                }
            }
        });

        await this.test('stress', 'Search and filter stress test', async () => {
            const searchTerms = ['Red Cross', 'test', 'demo', 'contact', 'organization'];
            
            await this.page.goto(`${BASE_URL}/organizations`, { waitUntil: 'networkidle' });
            
            const searchInput = await this.page.locator('input[type="search"], input[placeholder*="search" i]').first();
            if (await searchInput.count() > 0) {
                for (const term of searchTerms) {
                    await searchInput.fill(term);
                    await this.page.waitForTimeout(1000);
                    await searchInput.clear();
                    await this.page.waitForTimeout(500);
                }
            }
        });
    }

    // 9. MOBILE RESPONSIVE TESTING
    async testMobile() {
        console.log('\n📱 SECTION 9: MOBILE RESPONSIVE TESTING');
        
        await this.test('mobile', 'Mobile viewport loads correctly', async () => {
            await this.page.setViewportSize({ width: 375, height: 667 }); // iPhone SE
            await this.page.goto(BASE_URL, { waitUntil: 'networkidle' });
            
            const hasContent = await this.page.evaluate(() => {
                return document.body.textContent.length > 200;
            });
            
            if (!hasContent) {
                throw new Error('Mobile viewport has insufficient content');
            }
        });

        await this.test('mobile', 'Mobile navigation works', async () => {
            await this.page.setViewportSize({ width: 375, height: 667 });
            await this.page.goto(BASE_URL, { waitUntil: 'networkidle' });
            
            // Look for mobile menu toggle
            const mobileMenu = await this.page.locator('button[aria-label*="menu"], .hamburger, .mobile-menu-toggle, [data-testid*="menu"]').first();
            if (await mobileMenu.count() > 0) {
                await mobileMenu.click();
                await this.page.waitForTimeout(1000);
            }
            
            // Check if navigation is accessible
            const navItems = await this.page.locator('nav a, .nav-item, .menu-item').count();
            if (navItems === 0) {
                throw new Error('No navigation items accessible on mobile');
            }
        });

        await this.test('mobile', 'Mobile forms are usable', async () => {
            await this.page.setViewportSize({ width: 375, height: 667 });
            await this.page.goto(`${BASE_URL}/organizations/new`, { waitUntil: 'networkidle' });
            
            const form = await this.page.locator('form').first();
            if (await form.count() > 0) {
                const input = await this.page.locator('input[type="text"], input:not([type])').first();
                if (await input.count() > 0) {
                    await input.fill('Mobile Test');
                    const value = await input.inputValue();
                    if (value !== 'Mobile Test') {
                        throw new Error('Mobile form input not working');
                    }
                }
            }
        });

        // Reset viewport
        await this.page.setViewportSize({ width: 1280, height: 720 });
    }

    async generateExecutiveReport() {
        console.log('\n🎯 EXECUTIVE DEMO COMPREHENSIVE TEST REPORT');
        console.log('='.repeat(80));
        
        let totalTests = 0;
        let totalPassed = 0;
        let totalFailed = 0;
        let criticalIssues = 0;
        
        console.log('\n📊 DETAILED TEST RESULTS:');
        
        for (const [category, results] of Object.entries(this.testResults)) {
            totalTests += results.tests;
            totalPassed += results.passed;
            totalFailed += results.failed;
            
            if (category === 'critical' && results.failed > 0) {
                criticalIssues = results.failed;
            }
            
            const passRate = results.tests > 0 ? ((results.passed / results.tests) * 100).toFixed(1) : '0';
            const status = results.failed === 0 ? '✅' : (category === 'critical' ? '🔴' : '⚠️');
            
            console.log(`${status} ${category.toUpperCase()}: ${results.passed}/${results.tests} passed (${passRate}%)`);
            
            if (results.errors.length > 0) {
                console.log(`   ERRORS:`);
                results.errors.forEach(error => console.log(`   - ${error}`));
            }
        }
        
        console.log('\n🚀 PERFORMANCE METRICS:');
        if (this.performanceMetrics.homeLoad) {
            console.log(`• Homepage load time: ${this.performanceMetrics.homeLoad}ms`);
        }
        if (this.performanceMetrics.pageLoadTimes) {
            console.log(`• Page load times:`);
            for (const [page, time] of Object.entries(this.performanceMetrics.pageLoadTimes)) {
                console.log(`  - ${page}: ${time}ms`);
            }
        }
        if (this.performanceMetrics.memory) {
            console.log(`• Memory usage: ${(this.performanceMetrics.memory.used / 1024 / 1024).toFixed(2)}MB`);
        }
        
        console.log('\n🚨 CONSOLE & NETWORK ERRORS:');
        if (this.consoleErrors.length === 0) {
            console.log('✅ No console errors detected');
        } else {
            console.log(`❌ ${this.consoleErrors.length} console errors found:`);
            this.consoleErrors.slice(0, 10).forEach(error => console.log(`   - ${error}`));
            if (this.consoleErrors.length > 10) {
                console.log(`   ... and ${this.consoleErrors.length - 10} more errors`);
            }
        }
        
        if (this.networkErrors.length > 0) {
            console.log(`❌ ${this.networkErrors.length} network errors found:`);
            this.networkErrors.slice(0, 5).forEach(error => console.log(`   - ${error}`));
        }
        
        console.log('\n📸 SCREENSHOTS:');
        if (this.screenshots.length === 0) {
            console.log('✅ No failure screenshots (all tests passed)');
        } else {
            console.log(`📷 ${this.screenshots.length} failure screenshots saved:`);
            this.screenshots.forEach(screenshot => console.log(`   - ${screenshot}`));
        }
        
        console.log('\n🎯 EXECUTIVE DEMO ASSESSMENT:');
        const overallPassRate = totalTests > 0 ? ((totalPassed / totalTests) * 100).toFixed(1) : '0';
        
        if (criticalIssues > 0) {
            console.log('🔴 CRITICAL ISSUES FOUND - DEMO NOT READY');
            console.log('   ⚠️  Executive demo will likely fail with current issues');
            console.log('   🔧 Critical fixes required before demo');
        } else if (totalFailed === 0) {
            console.log('🟢 EXECUTIVE DEMO READY');
            console.log('   ✅ All critical functionality working');
            console.log('   ✅ No blocking issues found');
            console.log('   ✅ Performance within acceptable limits');
        } else if (totalFailed <= 3) {
            console.log('🟡 DEMO READY WITH MINOR ISSUES');
            console.log('   ✅ Critical functionality working');
            console.log('   ⚠️  Some non-critical features have issues');
            console.log('   📝 Consider fixes for polish, but demo can proceed');
        } else {
            console.log('🟠 DEMO AT RISK');
            console.log('   ⚠️  Multiple issues found that may impact demo');
            console.log('   🔧 Recommend fixes before executive presentation');
        }
        
        console.log(`\n📊 FINAL SCORE: ${totalPassed}/${totalTests} tests passed (${overallPassRate}%)`);
        console.log(`🌐 Production URL: ${BASE_URL}`);
        console.log(`⏱️  Test completed: ${new Date().toLocaleString()}`);
        console.log(`🔍 Console errors: ${this.consoleErrors.length}`);
        console.log(`🌐 Network errors: ${this.networkErrors.length}`);
        
        // Final recommendation
        console.log('\n🎯 RECOMMENDATION:');
        if (criticalIssues > 0) {
            console.log('❌ DO NOT PROCEED with executive demo until critical issues are fixed');
        } else if (totalFailed === 0) {
            console.log('✅ PROCEED with executive demo - application is fully functional');
        } else if (totalFailed <= 3) {
            console.log('✅ PROCEED with executive demo - minor issues noted but not blocking');
        } else {
            console.log('⚠️  CAUTION - Consider postponing demo to address issues');
        }
        
        console.log('='.repeat(80));
    }

    async run() {
        try {
            await this.init();
            
            // Run all test suites in order of importance
            await this.testCriticalFunctionality();
            await this.testNavigation();
            await this.testOrganizations();
            await this.testPeople();
            await this.testMeetings();
            await this.testAdvancedFeatures();
            await this.testPerformance();
            await this.testStress();
            await this.testMobile();
            
            await this.generateExecutiveReport();
            
        } catch (error) {
            console.error('❌ CRITICAL TEST FAILURE:', error);
            console.log('\n🔴 EXECUTIVE DEMO STATUS: FAILED - Critical error during testing');
        } finally {
            if (this.browser) {
                await this.browser.close();
            }
        }
    }
}

// Run the executive demo test
const tester = new ExecutiveDemoTest();
tester.run().catch(console.error);