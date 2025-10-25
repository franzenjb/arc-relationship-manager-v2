import { test, expect } from '@playwright/test'

test('Manual hierarchy verification', async ({ page }) => {
  // Navigate and login
  await page.goto('/')
  
  // Handle region selection
  const regionSelector = page.locator('text=Select your region to continue')
  if (await regionSelector.isVisible()) {
    await page.locator('text=National Headquarters').click()
    await page.locator('button:has-text("Access System")').click()
    await page.waitForSelector('nav', { timeout: 10000 })
  }
  
  // Go directly to a specific organization we know has county data
  await page.goto('/organizations')
  await page.waitForTimeout(3000) // Give it time to load
  
  // Take a screenshot of the organizations page
  await page.screenshot({ path: 'organizations-page.png', fullPage: true })
  
  // Try to find any organization link and click it
  const firstOrgLink = page.locator('a[href*="/organizations/"]').first()
  if (await firstOrgLink.isVisible()) {
    await firstOrgLink.click()
    await page.waitForTimeout(3000)
    
    // Take a screenshot of the organization detail page
    await page.screenshot({ path: 'organization-detail.png', fullPage: true })
    
    // Check if Red Cross hierarchy is visible
    const hierarchyText = page.locator('text=Red Cross Assignment')
    if (await hierarchyText.isVisible()) {
      console.log('✅ Red Cross hierarchy section found!')
      
      const divisionText = await page.locator('text=Division:').textContent()
      const regionText = await page.locator('text=Region:').textContent()
      const chapterText = await page.locator('text=Chapter:').textContent()
      const countyText = await page.locator('text=County:').textContent()
      
      console.log('Hierarchy data:')
      console.log('- Division:', divisionText)
      console.log('- Region:', regionText)
      console.log('- Chapter:', chapterText)
      console.log('- County:', countyText)
    } else {
      console.log('❌ No Red Cross hierarchy section found')
    }
  }
  
  // Also test the map page
  await page.goto('/map')
  await page.waitForTimeout(5000) // Give map time to load
  await page.screenshot({ path: 'map-page.png', fullPage: true })
  
  // Check for any obvious errors
  const errorElements = page.locator('text=Error, text=Failed, text=Not found')
  const errorCount = await errorElements.count()
  console.log(`Found ${errorCount} error messages on map page`)
})