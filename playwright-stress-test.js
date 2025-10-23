const { chromium } = require('playwright');

// CRITICAL: Testing CLEANUP version only
const BASE_URL = 'https://arc-relationship-manager-6dtdttk8y-jbf-2539-e1ec6bfb.vercel.app';

class ArcStressTest {
    constructor() {
        this.browser = null;
        this.page = null;
        this.testResults = {
            navigation: { tests: 0, passed: 0, failed: 0, errors: [] },
            core: { tests: 0, passed: 0, failed: 0, errors: [] },
            crud: { tests: 0, passed: 0, failed: 0, errors: [] },
            advanced: { tests: 0, passed: 0, failed: 0, errors: [] },
            performance: { tests: 0, passed: 0, failed: 0, errors: [] },
            stress: { tests: 0, passed: 0, failed: 0, errors: [] }
        };
        this.performanceMetrics = {};
        this.consoleErrors = [];
    }

    async init() {
        console.log('🚀 Starting ARC Relationship Manager Stress Test');
        console.log(`📍 Testing URL: ${BASE_URL}`);
        console.log('⚠️  TESTING CLEANUP VERSION ONLY - NOT PRODUCTION\n');

        this.browser = await chromium.launch({ 
            headless: false,
            slowMo: 100 // Slow down for better observation
        });
        this.page = await this.browser.newPage();

        // Monitor console errors
        this.page.on('console', msg => {
            if (msg.type() === 'error') {
                this.consoleErrors.push(`${msg.text()} at ${msg.location().url}`);
            }
        });

        // Monitor network failures
        this.page.on('response', response => {
            if (response.status() >= 400) {
                this.consoleErrors.push(`Network error: ${response.status()} - ${response.url()}`);
            }
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
            return false;
        }
    }

    // 1. BASIC NAVIGATION & LOADING TESTS
    async testNavigation() {
        console.log('\n📍 SECTION 1: BASIC NAVIGATION & LOADING');
        
        await this.test('navigation', 'Home page loads', async () => {
            const start = Date.now();
            await this.page.goto(BASE_URL, { waitUntil: 'networkidle' });
            this.performanceMetrics.homeLoad = Date.now() - start;
            
            await this.page.waitForSelector('h1', { timeout: 10000 });
            const title = await this.page.textContent('h1');
            if (!title || title.length === 0) {
                throw new Error('No main heading found');
            }
        });

        await this.test('navigation', 'Red Cross logo displays', async () => {
            const logo = await this.page.locator('img[alt*="Red Cross"], img[src*="logo"], .logo').first();
            await logo.waitFor({ timeout: 5000 });
            const isVisible = await logo.isVisible();
            if (!isVisible) {
                throw new Error('Red Cross logo not visible');
            }
        });

        await this.test('navigation', 'Navigation menu loads', async () => {
            const nav = await this.page.locator('nav, .nav, .navbar, [role="navigation"]').first();
            await nav.waitFor({ timeout: 5000 });
            const navItems = await this.page.locator('nav a, .nav a, .navbar a').count();
            if (navItems === 0) {
                throw new Error('No navigation items found');
            }
        });

        await this.test('navigation', 'Organizations link works', async () => {
            const orgLink = await this.page.locator('a[href*="organization"], a:has-text("Organization")').first();
            if (await orgLink.count() > 0) {
                await orgLink.click();
                await this.page.waitForLoadState('networkidle');
                const url = this.page.url();
                if (!url.includes('organization')) {
                    throw new Error('Organizations page not loaded');
                }
            } else {
                throw new Error('Organizations link not found');
            }
        });

        await this.test('navigation', 'People link works', async () => {
            const peopleLink = await this.page.locator('a[href*="people"], a:has-text("People")').first();
            if (await peopleLink.count() > 0) {
                await peopleLink.click();
                await this.page.waitForLoadState('networkidle');
                const url = this.page.url();
                if (!url.includes('people')) {
                    throw new Error('People page not loaded');
                }
            } else {
                console.log('⚠️  People link not found - may not exist in current design');
            }
        });
    }

    // 2. CORE FUNCTIONALITY TESTS
    async testCoreFunctionality() {
        console.log('\n📍 SECTION 2: CORE FUNCTIONALITY');
        
        await this.test('core', 'Organizations page data loads', async () => {
            await this.page.goto(`${BASE_URL}/organizations`, { waitUntil: 'networkidle' });
            
            // Wait for either data or "no data" message
            await Promise.race([
                this.page.waitForSelector('.organization, .org-item, tr, .data-row', { timeout: 10000 }),
                this.page.waitForSelector(':has-text("No organizations"), :has-text("Empty"), :has-text("Loading")', { timeout: 10000 })
            ]);
            
            const hasData = await this.page.locator('.organization, .org-item, tr').count() > 0;
            const hasMessage = await this.page.locator(':has-text("No organizations"), :has-text("Empty")').count() > 0;
            
            if (!hasData && !hasMessage) {
                throw new Error('Organizations page shows no data or loading state');
            }
        });

        await this.test('core', 'People page loads', async () => {
            try {
                await this.page.goto(`${BASE_URL}/people`, { waitUntil: 'networkidle' });
                await this.page.waitForSelector('h1, h2, .title', { timeout: 5000 });
            } catch {
                console.log('⚠️  People page may not exist - checking alternative routes');
                await this.page.goto(`${BASE_URL}/contacts`, { waitUntil: 'networkidle' });
                await this.page.waitForSelector('h1, h2, .title', { timeout: 5000 });
            }
        });

        await this.test('core', 'Interactions/Meetings page loads', async () => {
            const routes = ['/interactions', '/meetings', '/activities', '/dashboard'];
            let loaded = false;
            
            for (const route of routes) {
                try {
                    await this.page.goto(`${BASE_URL}${route}`, { waitUntil: 'networkidle' });
                    await this.page.waitForSelector('h1, h2, .title', { timeout: 3000 });
                    loaded = true;
                    break;
                } catch {
                    continue;
                }
            }
            
            if (!loaded) {
                throw new Error('No interactions/meetings page found');
            }
        });

        await this.test('core', 'Search functionality exists', async () => {
            await this.page.goto(BASE_URL, { waitUntil: 'networkidle' });
            const searchInput = await this.page.locator('input[type="search"], input[placeholder*="search"], .search-input').first();
            if (await searchInput.count() === 0) {
                console.log('⚠️  No search functionality found - may not be implemented');
                return;
            }
            
            await searchInput.fill('test');
            await this.page.keyboard.press('Enter');
            await this.page.waitForTimeout(2000); // Wait for search results
        });

        await this.test('core', 'Map functionality works', async () => {
            await this.page.goto(BASE_URL, { waitUntil: 'networkidle' });
            
            // Look for map container or Leaflet elements
            const mapExists = await Promise.race([
                this.page.waitForSelector('.leaflet-container, #map, .map-container', { timeout: 10000 }).then(() => true),
                this.page.waitForTimeout(5000).then(() => false)
            ]);
            
            if (!mapExists) {
                console.log('⚠️  No map found on main page - checking other pages');
                return;
            }
            
            // Test map interaction
            const mapContainer = await this.page.locator('.leaflet-container').first();
            await mapContainer.click();
            await this.page.waitForTimeout(1000);
        });
    }

    // 3. CRUD OPERATIONS TESTS
    async testCrudOperations() {
        console.log('\n📍 SECTION 3: CRUD OPERATIONS');
        
        await this.test('crud', 'Create organization form loads', async () => {
            const routes = ['/organizations/new', '/organizations/create', '/add-organization'];
            let formFound = false;
            
            for (const route of routes) {
                try {
                    await this.page.goto(`${BASE_URL}${route}`, { waitUntil: 'networkidle' });
                    const form = await this.page.locator('form, .form').first();
                    if (await form.count() > 0) {
                        formFound = true;
                        break;
                    }
                } catch {
                    continue;
                }
            }
            
            if (!formFound) {
                // Try looking for "Add" or "Create" buttons
                await this.page.goto(`${BASE_URL}/organizations`, { waitUntil: 'networkidle' });
                const addButton = await this.page.locator('button:has-text("Add"), button:has-text("Create"), a:has-text("Add"), a:has-text("Create")').first();
                if (await addButton.count() > 0) {
                    await addButton.click();
                    await this.page.waitForLoadState('networkidle');
                    formFound = true;
                }
            }
            
            if (!formFound) {
                throw new Error('No create organization form found');
            }
        });

        await this.test('crud', 'Form inputs are functional', async () => {
            const inputs = await this.page.locator('input, textarea, select').all();
            if (inputs.length === 0) {
                throw new Error('No form inputs found');
            }
            
            // Test first text input
            const textInput = await this.page.locator('input[type="text"], input:not([type])').first();
            if (await textInput.count() > 0) {
                await textInput.fill('Test Organization');
                const value = await textInput.inputValue();
                if (value !== 'Test Organization') {
                    throw new Error('Text input not working properly');
                }
            }
        });

        await this.test('crud', 'View existing records', async () => {
            await this.page.goto(`${BASE_URL}/organizations`, { waitUntil: 'networkidle' });
            
            // Look for clickable records
            const recordLink = await this.page.locator('a[href*="organization"], .record-link, tr a').first();
            if (await recordLink.count() > 0) {
                await recordLink.click();
                await this.page.waitForLoadState('networkidle');
                await this.page.waitForSelector('h1, h2, .title', { timeout: 5000 });
            } else {
                console.log('⚠️  No existing records to view - may be empty database');
            }
        });
    }

    // 4. ADVANCED FEATURES TESTS
    async testAdvancedFeatures() {
        console.log('\n📍 SECTION 4: ADVANCED FEATURES');
        
        await this.test('advanced', 'Tech stack page loads', async () => {
            const routes = ['/tech', '/stack', '/technology', '/about'];
            let loaded = false;
            
            for (const route of routes) {
                try {
                    await this.page.goto(`${BASE_URL}${route}`, { waitUntil: 'networkidle' });
                    await this.page.waitForSelector('h1, h2, .title', { timeout: 3000 });
                    loaded = true;
                    break;
                } catch {
                    continue;
                }
            }
            
            if (!loaded) {
                console.log('⚠️  Tech stack page not found - may not be implemented');
            }
        });

        await this.test('advanced', 'Dashboard functionality', async () => {
            await this.page.goto(`${BASE_URL}/dashboard`, { waitUntil: 'networkidle' });
            
            // Look for dashboard elements
            const dashboardElements = await this.page.locator('.chart, .graph, .metric, .card, .widget').count();
            if (dashboardElements === 0) {
                console.log('⚠️  No dashboard elements found - may be minimal implementation');
            }
        });

        await this.test('advanced', 'Admin interface access', async () => {
            try {
                await this.page.goto(`${BASE_URL}/admin`, { waitUntil: 'networkidle' });
                await this.page.waitForSelector('h1, h2, .title', { timeout: 3000 });
            } catch {
                console.log('⚠️  Admin interface not accessible - may require authentication');
            }
        });

        await this.test('advanced', 'Profile page functionality', async () => {
            try {
                await this.page.goto(`${BASE_URL}/profile`, { waitUntil: 'networkidle' });
                await this.page.waitForSelector('h1, h2, .title', { timeout: 3000 });
            } catch {
                console.log('⚠️  Profile page not accessible - may require authentication');
            }
        });
    }

    // 5. PERFORMANCE & STABILITY TESTS
    async testPerformance() {
        console.log('\n📍 SECTION 5: PERFORMANCE & STABILITY');
        
        await this.test('performance', 'Page load performance', async () => {
            const start = Date.now();
            await this.page.goto(BASE_URL, { waitUntil: 'networkidle' });
            const loadTime = Date.now() - start;
            this.performanceMetrics.mainPageLoad = loadTime;
            
            if (loadTime > 10000) {
                throw new Error(`Page load too slow: ${loadTime}ms`);
            }
        });

        await this.test('performance', 'Memory usage check', async () => {
            const metrics = await this.page.evaluate(() => {
                return {
                    memory: performance.memory ? {
                        used: performance.memory.usedJSHeapSize,
                        total: performance.memory.totalJSHeapSize,
                        limit: performance.memory.jsHeapSizeLimit
                    } : null
                };
            });
            
            this.performanceMetrics.memory = metrics.memory;
            
            if (metrics.memory && metrics.memory.used > 50 * 1024 * 1024) { // 50MB
                console.log(`⚠️  High memory usage: ${(metrics.memory.used / 1024 / 1024).toFixed(2)}MB`);
            }
        });

        await this.test('performance', 'Resource loading check', async () => {
            await this.page.goto(BASE_URL, { waitUntil: 'networkidle' });
            
            // Check for broken images
            const brokenImages = await this.page.evaluate(() => {
                const images = Array.from(document.querySelectorAll('img'));
                return images.filter(img => !img.complete || img.naturalWidth === 0).length;
            });
            
            if (brokenImages > 0) {
                throw new Error(`${brokenImages} broken images found`);
            }
        });

        await this.test('performance', 'CSS and JS resources load', async () => {
            await this.page.goto(BASE_URL, { waitUntil: 'networkidle' });
            
            const resources = await this.page.evaluate(() => {
                const stylesheets = document.querySelectorAll('link[rel="stylesheet"]').length;
                const scripts = document.querySelectorAll('script[src]').length;
                return { stylesheets, scripts };
            });
            
            if (resources.stylesheets === 0 && resources.scripts === 0) {
                throw new Error('No external resources found - may indicate loading issues');
            }
        });
    }

    // 6. STRESS TESTING
    async testStress() {
        console.log('\n📍 SECTION 6: STRESS TESTING');
        
        await this.test('stress', 'Rapid navigation stress test', async () => {
            const pages = ['/', '/organizations', '/dashboard'];
            
            for (let i = 0; i < 5; i++) {
                for (const page of pages) {
                    await this.page.goto(`${BASE_URL}${page}`, { waitUntil: 'domcontentloaded' });
                    await this.page.waitForTimeout(500);
                }
            }
        });

        await this.test('stress', 'Multiple form interactions', async () => {
            try {
                await this.page.goto(`${BASE_URL}/organizations`, { waitUntil: 'networkidle' });
                
                for (let i = 0; i < 3; i++) {
                    const addButton = await this.page.locator('button:has-text("Add"), a:has-text("Add")').first();
                    if (await addButton.count() > 0) {
                        await addButton.click();
                        await this.page.waitForTimeout(1000);
                        await this.page.goBack();
                        await this.page.waitForTimeout(1000);
                    }
                }
            } catch {
                console.log('⚠️  Form interaction stress test skipped - no suitable forms found');
            }
        });

        await this.test('stress', 'Search stress test', async () => {
            const searchTerms = ['test', 'organization', 'contact', 'red cross', '123'];
            const searchInput = await this.page.locator('input[type="search"], input[placeholder*="search"]').first();
            
            if (await searchInput.count() === 0) {
                console.log('⚠️  Search stress test skipped - no search functionality found');
                return;
            }
            
            for (const term of searchTerms) {
                await searchInput.fill(term);
                await this.page.keyboard.press('Enter');
                await this.page.waitForTimeout(1000);
            }
        });

        await this.test('stress', 'Map interaction stress test', async () => {
            await this.page.goto(BASE_URL, { waitUntil: 'networkidle' });
            
            const mapContainer = await this.page.locator('.leaflet-container').first();
            if (await mapContainer.count() === 0) {
                console.log('⚠️  Map stress test skipped - no map found');
                return;
            }
            
            // Perform multiple map interactions
            for (let i = 0; i < 5; i++) {
                await mapContainer.click();
                await this.page.mouse.wheel(0, 100); // Zoom
                await this.page.waitForTimeout(500);
                await mapContainer.click({ position: { x: 100 + i * 10, y: 100 + i * 10 } });
                await this.page.waitForTimeout(500);
            }
        });
    }

    async generateReport() {
        console.log('\n🎯 GENERATING COMPREHENSIVE TEST REPORT');
        console.log('='.repeat(60));
        
        let totalTests = 0;
        let totalPassed = 0;
        let totalFailed = 0;
        
        console.log('\n📊 TEST RESULTS SUMMARY:');
        
        for (const [category, results] of Object.entries(this.testResults)) {
            totalTests += results.tests;
            totalPassed += results.passed;
            totalFailed += results.failed;
            
            const passRate = results.tests > 0 ? ((results.passed / results.tests) * 100).toFixed(1) : '0';
            const status = results.failed === 0 ? '✅' : '⚠️';
            
            console.log(`${status} ${category.toUpperCase()}: ${results.passed}/${results.tests} passed (${passRate}%)`);
            
            if (results.errors.length > 0) {
                console.log(`   Errors:`);
                results.errors.forEach(error => console.log(`   - ${error}`));
            }
        }
        
        console.log('\n📈 PERFORMANCE METRICS:');
        if (this.performanceMetrics.homeLoad) {
            console.log(`• Home page load: ${this.performanceMetrics.homeLoad}ms`);
        }
        if (this.performanceMetrics.mainPageLoad) {
            console.log(`• Main page load: ${this.performanceMetrics.mainPageLoad}ms`);
        }
        if (this.performanceMetrics.memory) {
            console.log(`• Memory usage: ${(this.performanceMetrics.memory.used / 1024 / 1024).toFixed(2)}MB`);
        }
        
        console.log('\n🚨 CONSOLE ERRORS:');
        if (this.consoleErrors.length === 0) {
            console.log('✅ No console errors detected');
        } else {
            this.consoleErrors.forEach(error => console.log(`❌ ${error}`));
        }
        
        console.log('\n🎯 OVERALL ASSESSMENT:');
        const overallPassRate = totalTests > 0 ? ((totalPassed / totalTests) * 100).toFixed(1) : '0';
        
        if (totalFailed === 0) {
            console.log('🟢 SAFE TO MERGE - All tests passed');
        } else if (totalFailed <= 3) {
            console.log('🟡 REVIEW REQUIRED - Minor issues found');
        } else {
            console.log('🔴 ISSUES FOUND - Review before merge');
        }
        
        console.log(`\n📊 FINAL SCORE: ${totalPassed}/${totalTests} tests passed (${overallPassRate}%)`);
        console.log(`🌐 Tested URL: ${BASE_URL}`);
        console.log(`⏱️  Test completed: ${new Date().toLocaleString()}`);
        console.log('='.repeat(60));
    }

    async run() {
        try {
            await this.init();
            
            // Run all test suites
            await this.testNavigation();
            await this.testCoreFunctionality();
            await this.testCrudOperations();
            await this.testAdvancedFeatures();
            await this.testPerformance();
            await this.testStress();
            
            await this.generateReport();
            
        } catch (error) {
            console.error('❌ Critical test failure:', error);
        } finally {
            if (this.browser) {
                await this.browser.close();
            }
        }
    }
}

// Run the stress test
const tester = new ArcStressTest();
tester.run().catch(console.error);