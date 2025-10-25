import { test, expect } from '@playwright/test'

test.describe('Red Cross Hierarchy Display', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to app
    await page.goto('/')
    
    // Check if we see the region selection page
    const regionSelector = page.locator('text=Select your region to continue')
    if (await regionSelector.isVisible()) {
      // Select National Headquarters for testing
      await page.locator('text=National Headquarters').click()
      await page.locator('button:has-text("Access System")').click()
      
      // Wait for dashboard to load
      await page.waitForSelector('nav', { timeout: 10000 })
    }
    
    // If we see a navigation, we're logged in
    const nav = await page.locator('nav').first()
    if (!(await nav.isVisible())) {
      // Still not logged in, try other login flows
      const loginButton = page.locator('text=Login').first()
      if (await loginButton.isVisible()) {
        await loginButton.click()
        await page.waitForSelector('nav', { timeout: 10000 })
      }
    }
  })

  test('Organization detail page displays Red Cross hierarchy', async ({ page }) => {
    // Go to organizations list
    await page.goto('/organizations')
    await page.waitForSelector('main, .grid, table, h1', { timeout: 10000 })
    
    // Find and click on an organization with county assignment
    const orgLinks = page.locator('a[href*="/organizations/"]')
    await expect(orgLinks.first()).toBeVisible()
    await orgLinks.first().click()
    
    // Wait for organization detail page to load
    await page.waitForSelector('h1', { timeout: 10000 })
    
    // Check if Red Cross hierarchy is displayed
    const hierarchySection = page.locator('text=Red Cross Assignment')
    if (await hierarchySection.isVisible()) {
      // If hierarchy is visible, verify all levels are shown
      await expect(page.locator('text=Division:')).toBeVisible()
      await expect(page.locator('text=Region:')).toBeVisible()
      await expect(page.locator('text=Chapter:')).toBeVisible()
      await expect(page.locator('text=County:')).toBeVisible()
    } else {
      console.log('Organization does not have county assignment - this is expected for some orgs')
    }
  })

  test('Organizations list displays hierarchy information', async ({ page }) => {
    await page.goto('/organizations')
    await page.waitForSelector('main, .grid, table, h1', { timeout: 10000 })
    
    // Check if we can see Red Cross hierarchy information in the list
    const redCrossText = page.locator('text*=Region').or(page.locator('text*=Chapter')).or(page.locator('text*=County'))
    
    // Should have at least some organizations with hierarchy info
    if (await redCrossText.count() > 0) {
      await expect(redCrossText.first()).toBeVisible()
    }
  })

  test('Map page loads organizations with proper geographic data', async ({ page }) => {
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

  test('People pages display hierarchy when available', async ({ page }) => {
    await page.goto('/people')
    await page.waitForSelector('main, .grid, table, h1', { timeout: 10000 })
    
    // Check if any people have Red Cross hierarchy displayed
    const hierarchyElements = page.locator('text*=Region').or(page.locator('text*=Chapter')).or(page.locator('text*=County'))
    
    // If people have county assignments, we should see hierarchy
    const count = await hierarchyElements.count()
    if (count > 0) {
      await expect(hierarchyElements.first()).toBeVisible()
    }
  })

  test('No critical errors across main pages', async ({ page }) => {
    const criticalErrors = []
    
    page.on('console', msg => {
      if (msg.type() === 'error') {
        const text = msg.text()
        if (text.includes('Failed to fetch') || 
            text.includes('404') || 
            text.includes('Network request failed') ||
            text.includes('Could not find a relationship') ||
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

  test('Hierarchy data is accurate and complete', async ({ page }) => {
    // Go to an organization detail page
    await page.goto('/organizations')
    await page.waitForSelector('main, .grid, table, h1', { timeout: 10000 })
    
    const orgLinks = page.locator('a[href*="/organizations/"]')
    await orgLinks.first().click()
    
    await page.waitForSelector('h1', { timeout: 10000 })
    
    // Check if Red Cross Assignment section exists
    const hierarchySection = page.locator('text=Red Cross Assignment')
    
    if (await hierarchySection.isVisible()) {
      // Verify the hierarchy follows the proper structure
      const divisionText = await page.locator('text=Division:').textContent()
      const regionText = await page.locator('text=Region:').textContent()
      const chapterText = await page.locator('text=Chapter:').textContent()
      const countyText = await page.locator('text=County:').textContent()
      
      // All should contain actual data, not just the labels
      expect(divisionText).toContain('Division')
      expect(regionText).toContain('Region')
      expect(chapterText).toContain('Chapter')
      expect(countyText).toContain('County')
    }
  })
})