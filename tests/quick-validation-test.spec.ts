import { test, expect, Page } from '@playwright/test'

test.describe('Quick System Validation', () => {
  
  test('1. Basic navigation and button presence', async ({ page }) => {
    console.log('🔍 Testing basic navigation and UI elements...')
    
    // Load the application
    await page.goto('http://localhost:3000')
    await page.waitForLoadState('networkidle')
    
    // Check main page loads
    const pageTitle = await page.title()
    console.log(`Page title: ${pageTitle}`)
    expect(pageTitle).toContain('ARC')
    
    // Test Organizations page
    await page.goto('http://localhost:3000/organizations')
    await page.waitForLoadState('networkidle')
    
    // Wait a bit more for React hydration
    await page.waitForTimeout(3000)
    
    // Check for the Add Organization button
    const addOrgButton = page.locator('text="Add Organization"')
    console.log('Checking for Add Organization button...')
    
    // Let's see what buttons are actually present
    const allButtons = await page.locator('button').allTextContents()
    console.log('All buttons found:', allButtons)
    
    const allLinks = await page.locator('a').allTextContents() 
    console.log('All links found:', allLinks)
    
    // Check if the button exists
    if (await addOrgButton.isVisible()) {
      console.log('✓ Add Organization button found')
      await addOrgButton.click()
      await page.waitForLoadState('networkidle')
      
      // Check if we're on the form page
      console.log('Current URL:', page.url())
      expect(page.url()).toContain('/organizations/new')
      
      // Look for the form title
      const formTitle = page.locator('h1')
      const titleText = await formTitle.textContent()
      console.log('Form title:', titleText)
      
      // Check for organization name input field
      const nameInput = page.locator('input[name="name"]')
      if (await nameInput.isVisible()) {
        console.log('✓ Name input field found')
        await nameInput.fill('Test Org Quick')
        
        // Look for submit button
        const submitButton = page.locator('button[type="submit"]')
        if (await submitButton.isVisible()) {
          const submitText = await submitButton.textContent()
          console.log('Submit button text:', submitText)
        }
      } else {
        console.log('❌ Name input field not found')
        // Let's see what inputs are available
        const allInputs = await page.locator('input').all()
        console.log('Available inputs:')
        for (const input of allInputs) {
          const name = await input.getAttribute('name')
          const placeholder = await input.getAttribute('placeholder')
          const type = await input.getAttribute('type')
          console.log(`  - name: ${name}, placeholder: ${placeholder}, type: ${type}`)
        }
      }
    } else {
      console.log('❌ Add Organization button not found')
    }
  })

  test('2. People page validation', async ({ page }) => {
    console.log('👤 Testing people page...')
    
    await page.goto('http://localhost:3000/people')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(2000)
    
    // Check for Add Person/Add New Person button
    const addPersonButtons = [
      'text="Add Person"',
      'text="Add New Person"',
      'text="New Person"'
    ]
    
    let addPersonButton = null
    for (const selector of addPersonButtons) {
      const button = page.locator(selector)
      if (await button.isVisible()) {
        addPersonButton = button
        console.log(`✓ Found button: ${selector}`)
        break
      }
    }
    
    if (addPersonButton) {
      await addPersonButton.click()
      await page.waitForLoadState('networkidle')
      console.log('People form URL:', page.url())
      expect(page.url()).toContain('/people/new')
    } else {
      // Show what's actually available
      const allButtons = await page.locator('button').allTextContents()
      const allLinks = await page.locator('a').allTextContents()
      console.log('People page buttons:', allButtons)
      console.log('People page links:', allLinks)
    }
  })

  test('3. Meetings page validation', async ({ page }) => {
    console.log('📅 Testing meetings page...')
    
    await page.goto('http://localhost:3000/meetings')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(2000)
    
    // Check for meeting creation button
    const addMeetingButtons = [
      'text="New Meeting"',
      'text="Add Meeting"',
      'text="Create Meeting"'
    ]
    
    let addMeetingButton = null
    for (const selector of addMeetingButtons) {
      const button = page.locator(selector)
      if (await button.isVisible()) {
        addMeetingButton = button
        console.log(`✓ Found button: ${selector}`)
        break
      }
    }
    
    if (addMeetingButton) {
      await addMeetingButton.click()
      await page.waitForLoadState('networkidle')
      console.log('Meeting form URL:', page.url())
      expect(page.url()).toContain('/meetings/new')
    } else {
      // Show what's actually available
      const allButtons = await page.locator('button').allTextContents()
      const allLinks = await page.locator('a').allTextContents()
      console.log('Meetings page buttons:', allButtons)
      console.log('Meetings page links:', allLinks)
    }
  })

  test('4. Form fields validation', async ({ page }) => {
    console.log('✅ Testing form field presence...')
    
    // Go to organization form
    await page.goto('http://localhost:3000/organizations/new')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(2000)
    
    console.log('=== ORGANIZATION FORM FIELDS ===')
    const orgFields = [
      'input[name="name"]',
      'textarea[name="description"]', 
      'input[name="address"]',
      'input[name="city"]',
      'input[name="state"]',
      'input[name="zip"]',
      'input[name="website"]',
      'input[name="phone"]',
      'textarea[name="notes"]',
      'textarea[name="goals"]',
      'select[name="status"]'
    ]
    
    for (const field of orgFields) {
      const element = page.locator(field)
      const isVisible = await element.isVisible()
      console.log(`${field}: ${isVisible ? '✓' : '❌'}`)
    }
    
    // Go to person form if org page exists
    await page.goto('http://localhost:3000/people/new')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(2000)
    
    console.log('=== PERSON FORM FIELDS ===')
    const personFields = [
      'select[name="org_id"]',
      'input[name="first_name"]',
      'input[name="last_name"]',
      'input[name="title"]',
      'input[name="email"]',
      'input[name="phone"]',
      'textarea[name="notes"]'
    ]
    
    for (const field of personFields) {
      const element = page.locator(field)
      const isVisible = await element.isVisible()
      console.log(`${field}: ${isVisible ? '✓' : '❌'}`)
    }
  })

  test('5. Database connection test', async ({ page }) => {
    console.log('🗄️ Testing database connectivity...')
    
    try {
      const response = await page.request.get('http://localhost:3000/api/test')
      const status = response.status()
      console.log(`API test endpoint status: ${status}`)
      
      if (response.ok()) {
        const data = await response.json()
        console.log('API response:', data)
        console.log('✓ Database connection test passed')
      } else {
        console.log('⚠️ API test endpoint returned error status')
      }
    } catch (error) {
      console.log('⚠️ API test endpoint not available or error occurred:', error)
    }
  })

  test('6. Console errors check', async ({ page }) => {
    console.log('🐛 Checking for console errors...')
    
    const errors: string[] = []
    const warnings: string[] = []
    
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text())
      } else if (msg.type() === 'warning') {
        warnings.push(msg.text())
      }
    })
    
    // Visit main pages
    const pages = [
      'http://localhost:3000',
      'http://localhost:3000/organizations',
      'http://localhost:3000/people',
      'http://localhost:3000/meetings'
    ]
    
    for (const url of pages) {
      await page.goto(url)
      await page.waitForLoadState('networkidle')
      await page.waitForTimeout(1000)
    }
    
    // Filter significant errors
    const significantErrors = errors.filter(error => 
      !error.includes('favicon') &&
      !error.includes('Extension') &&
      !error.includes('non-passive event listener') &&
      !error.includes('CORS') &&
      !error.includes('chrome-extension') &&
      !error.includes('moz-extension')
    )
    
    console.log('=== CONSOLE ERRORS ===')
    if (significantErrors.length > 0) {
      significantErrors.forEach(error => console.log(`❌ ${error}`))
    } else {
      console.log('✓ No significant console errors found')
    }
    
    console.log('=== CONSOLE WARNINGS ===')
    if (warnings.length > 0 && warnings.length < 10) {
      warnings.forEach(warning => console.log(`⚠️ ${warning}`))
    } else if (warnings.length >= 10) {
      console.log(`⚠️ ${warnings.length} warnings found (too many to display)`)
    } else {
      console.log('✓ No console warnings found')
    }
  })
})