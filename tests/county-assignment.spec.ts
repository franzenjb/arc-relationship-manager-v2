import { test, expect } from '@playwright/test'

test.describe('County Assignment System', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to login page
    await page.goto('/')
    
    // Check if we're already logged in by looking for navigation elements
    const nav = await page.locator('nav').first()
    const isLoggedIn = await nav.isVisible().catch(() => false)
    
    if (!isLoggedIn) {
      // If not logged in, perform login
      const loginButton = page.locator('text=Login').first()
      if (await loginButton.isVisible()) {
        await loginButton.click()
      }
      
      // Wait for login to complete (look for dashboard or navigation)
      await page.waitForSelector('nav', { timeout: 10000 })
    }
  })

  test('Organizations page loads and displays county information', async ({ page }) => {
    await page.goto('/organizations')
    
    // Wait for organizations to load
    await page.waitForSelector('[data-testid="organizations-list"], .grid, table', { timeout: 10000 })
    
    // Check for no console errors
    const logs = []
    page.on('console', msg => {
      if (msg.type() === 'error') {
        logs.push(msg.text())
      }
    })
    
    // Verify page title or heading
    await expect(page.locator('h1, h2').first()).toBeVisible()
    
    // Check that no critical errors occurred
    await page.waitForTimeout(2000) // Give time for any async operations
    expect(logs.filter(log => log.includes('Failed to fetch') || log.includes('404'))).toHaveLength(0)
  })

  test('Organization creation form includes county selector', async ({ page }) => {
    await page.goto('/organizations/new')
    
    // Wait for form to load
    await page.waitForSelector('form', { timeout: 10000 })
    
    // Check for county selector - it might be a select or custom component
    const countyField = page.locator('select[name*="county"], [data-testid="county-selector"], label:has-text("County")')
    await expect(countyField.first()).toBeVisible()
    
    // Check for address fields that trigger geocoding
    await expect(page.locator('input[name*="address"], input[placeholder*="address"]')).toBeVisible()
    await expect(page.locator('input[name*="city"], input[placeholder*="city"]')).toBeVisible()
    await expect(page.locator('input[name*="state"], input[placeholder*="state"]')).toBeVisible()
  })

  test('People page loads and displays people information', async ({ page }) => {
    await page.goto('/people')
    
    // Wait for people list to load
    await page.waitForSelector('[data-testid="people-list"], .grid, table', { timeout: 10000 })
    
    // Check for no console errors
    const logs = []
    page.on('console', msg => {
      if (msg.type() === 'error') {
        logs.push(msg.text())
      }
    })
    
    // Verify page loads correctly
    await expect(page.locator('h1, h2').first()).toBeVisible()
    
    // Wait for any async operations
    await page.waitForTimeout(2000)
    expect(logs.filter(log => log.includes('Failed to fetch') || log.includes('404'))).toHaveLength(0)
  })

  test('Person creation form includes address fields and county selector', async ({ page }) => {
    await page.goto('/people/new')
    
    // Wait for form to load
    await page.waitForSelector('form', { timeout: 10000 })
    
    // Check for county selector
    const countyField = page.locator('select[name*="county"], [data-testid="county-selector"], label:has-text("County")')
    await expect(countyField.first()).toBeVisible()
    
    // Check for address section for sole proprietors
    await expect(page.locator('text=Address Information')).toBeVisible()
    await expect(page.locator('input[name*="address"], input[placeholder*="address"]')).toBeVisible()
    await expect(page.locator('input[name*="city"], input[placeholder*="city"]')).toBeVisible()
    await expect(page.locator('input[name*="state"], input[placeholder*="state"]')).toBeVisible()
  })

  test('Map page loads and displays with county-based data', async ({ page }) => {
    await page.goto('/map')
    
    // Wait for map to initialize
    await page.waitForSelector('.leaflet-container, [data-testid="map"], #map', { timeout: 15000 })
    
    // Check for no critical console errors
    const logs = []
    page.on('console', msg => {
      if (msg.type() === 'error') {
        logs.push(msg.text())
      }
    })
    
    // Wait for map to fully load
    await page.waitForTimeout(3000)
    
    // Check that map loaded without critical errors
    expect(logs.filter(log => 
      log.includes('Failed to fetch') || 
      log.includes('404') || 
      log.includes('Network request failed')
    )).toHaveLength(0)
    
    // Verify map container is visible
    await expect(page.locator('.leaflet-container, [data-testid="map"], #map')).toBeVisible()
  })

  test('Navigation works properly across all pages', async ({ page }) => {
    // Start from home
    await page.goto('/')
    
    // Test navigation to each main page
    const pages = [
      { path: '/organizations', text: 'Organizations' },
      { path: '/people', text: 'People' },
      { path: '/meetings', text: 'Meetings' },
      { path: '/map', text: 'Map' },
      { path: '/activity', text: 'Activity' }
    ]
    
    for (const pageInfo of pages) {
      // Navigate to page
      await page.goto(pageInfo.path)
      
      // Wait for page to load
      await page.waitForSelector('h1, h2, nav', { timeout: 10000 })
      
      // Check that page loaded (no 404 or error)
      const content = await page.textContent('body')
      expect(content).not.toContain('404')
      expect(content).not.toContain('Page not found')
      
      // Check for no critical console errors on this page
      const logs = []
      page.on('console', msg => {
        if (msg.type() === 'error') {
          logs.push(msg.text())
        }
      })
      
      await page.waitForTimeout(1000)
      expect(logs.filter(log => log.includes('Failed to fetch'))).toHaveLength(0)
    }
  })

  test('No critical console errors across the application', async ({ page }) => {
    const criticalErrors = []
    
    page.on('console', msg => {
      if (msg.type() === 'error') {
        const text = msg.text()
        if (text.includes('Failed to fetch') || 
            text.includes('404') || 
            text.includes('Network request failed') ||
            text.includes('Uncaught')) {
          criticalErrors.push(text)
        }
      }
    })
    
    // Visit main pages
    const pagesToTest = ['/', '/organizations', '/people', '/meetings', '/map']
    
    for (const path of pagesToTest) {
      await page.goto(path)
      await page.waitForTimeout(2000) // Allow time for async operations
    }
    
    // Report any critical errors found
    if (criticalErrors.length > 0) {
      console.log('Critical errors found:', criticalErrors)
    }
    
    expect(criticalErrors).toHaveLength(0)
  })
})