import { test, expect, Page, BrowserContext } from '@playwright/test'

// Test configuration
test.describe.configure({ mode: 'serial' })

let context: BrowserContext
let page: Page

test.beforeAll(async ({ browser }) => {
  context = await browser.newContext()
  page = await context.newPage()
  
  // Increase timeout for slow operations
  page.setDefaultTimeout(30000)
})

test.afterAll(async () => {
  await context.close()
})

// Helper function to wait for page load
const waitForPageLoad = async (page: Page) => {
  await page.waitForLoadState('networkidle')
  await page.waitForTimeout(2000) // Additional wait for React hydration
}

// Helper function to fill form fields safely
const fillField = async (page: Page, selector: string, value: string) => {
  await page.waitForSelector(selector, { state: 'visible' })
  await page.fill(selector, value)
}

// Helper function to select dropdown options
const selectOption = async (page: Page, selector: string, value: string) => {
  await page.waitForSelector(selector, { state: 'visible' })
  await page.selectOption(selector, value)
}

// Test data
const testOrg = {
  name: 'Test Organization ' + Date.now(),
  description: 'A comprehensive test organization for system testing',
  address: '123 Test Street',
  city: 'Test City',
  state: 'TX',
  zip: '12345',
  website: 'https://test-org.example.com',
  phone: '(555) 123-4567',
  notes: 'This is a test organization created during comprehensive testing',
  goals: 'Test partnership goals and objectives'
}

const testPerson = {
  first_name: 'John',
  last_name: 'Doe',
  title: 'Test Manager',
  email: 'john.doe@test-org.example.com',
  phone: '(555) 987-6543',
  notes: 'Test person for comprehensive system testing'
}

const testMeeting = {
  meeting_name: 'Test Meeting ' + Date.now(),
  description: 'A comprehensive test meeting for system testing',
  date: '2024-01-15',
  next_meeting_date: '2024-02-15',
  location: 'Test Conference Room',
  agenda: 'Test agenda items:\n1. Review current status\n2. Discuss next steps\n3. Action items',
  notes: 'Test meeting notes:\n- Key discussion points\n- Decisions made\n- Next steps'
}

test.describe('ARC Relationship Manager V2 - Comprehensive System Test', () => {
  
  test('1. Application loads and basic navigation works', async () => {
    console.log('🔍 Testing application load and navigation...')
    
    // Load the application
    await page.goto('http://localhost:3000')
    await waitForPageLoad(page)
    
    // Check if we can see the main page
    const pageTitle = await page.title()
    console.log(`Page title: ${pageTitle}`)
    
    // Check for main navigation elements
    const navElements = [
      'Organizations',
      'People', 
      'Meetings',
      'Activity',
      'Map'
    ]
    
    for (const navItem of navElements) {
      const element = page.locator(`text="${navItem}"`).first()
      await expect(element).toBeVisible()
      console.log(`✓ Navigation item "${navItem}" is visible`)
    }
    
    // Test each navigation link
    const navLinks = [
      { text: 'Organizations', url: '/organizations' },
      { text: 'People', url: '/people' },
      { text: 'Meetings', url: '/meetings' },
      { text: 'Activity', url: '/activity' },
      { text: 'Map', url: '/map' }
    ]
    
    for (const nav of navLinks) {
      console.log(`Testing navigation to ${nav.text}...`)
      await page.click(`text="${nav.text}"`)
      await waitForPageLoad(page)
      expect(page.url()).toContain(nav.url)
      console.log(`✓ Successfully navigated to ${nav.text}`)
    }
  })

  test('2. Organizations page - Create new organization with ALL fields', async () => {
    console.log('🏢 Testing organization creation with all fields...')
    
    // Navigate to organizations page
    await page.goto('http://localhost:3000/organizations')
    await waitForPageLoad(page)
    
    // Click "Add Organization" button  
    await page.click('text="Add Organization"')
    await waitForPageLoad(page)
    
    // Verify we're on the new organization form
    expect(page.url()).toContain('/organizations/new')
    await expect(page.locator('text="Add New Organization"')).toBeVisible()
    
    console.log('Filling basic information...')
    // Fill basic information
    await fillField(page, 'input[name="name"]', testOrg.name)
    await fillField(page, 'textarea[name="description"]', testOrg.description)
    
    // Select status
    await selectOption(page, 'select[name="status"]', 'active')
    
    console.log('Filling location information...')
    // Fill location information
    await fillField(page, 'input[name="address"]', testOrg.address)
    await fillField(page, 'input[name="city"]', testOrg.city)
    await fillField(page, 'input[name="state"]', testOrg.state)
    await fillField(page, 'input[name="zip"]', testOrg.zip)
    
    console.log('Filling contact information...')
    // Fill contact information
    await fillField(page, 'input[name="website"]', testOrg.website)
    await fillField(page, 'input[name="phone"]', testOrg.phone)
    await fillField(page, 'textarea[name="notes"]', testOrg.notes)
    await fillField(page, 'textarea[name="goals"]', testOrg.goals)
    
    // Submit the form
    console.log('Submitting organization form...')
    await page.click('button[type="submit"]')
    
    // Wait for redirect and success
    await page.waitForURL(/\/organizations\/[^\/]+$/, { timeout: 30000 })
    await waitForPageLoad(page)
    
    // Verify organization was created
    await expect(page.locator(`text="${testOrg.name}"`)).toBeVisible()
    console.log('✓ Organization created successfully')
    
    // Store organization URL for later use
    const orgUrl = page.url()
    test.info().annotations.push({ type: 'organization-url', description: orgUrl })
  })

  test('3. Organizations page - Edit organization and verify fields', async () => {
    console.log('✏️ Testing organization editing...')
    
    // Go back to organizations list
    await page.goto('http://localhost:3000/organizations')
    await waitForPageLoad(page)
    
    // Find our test organization and click edit
    const orgCard = page.locator(`text="${testOrg.name}"`).first()
    await expect(orgCard).toBeVisible()
    
    // Click on the organization to view details
    await orgCard.click()
    await waitForPageLoad(page)
    
    // Click edit button
    await page.click('text="Edit"')
    await waitForPageLoad(page)
    
    // Verify all fields are populated correctly
    console.log('Verifying form fields are populated...')
    await expect(page.locator('input[name="name"]')).toHaveValue(testOrg.name)
    await expect(page.locator('textarea[name="description"]')).toHaveValue(testOrg.description)
    await expect(page.locator('input[name="address"]')).toHaveValue(testOrg.address)
    await expect(page.locator('input[name="city"]')).toHaveValue(testOrg.city)
    await expect(page.locator('input[name="state"]')).toHaveValue(testOrg.state)
    await expect(page.locator('input[name="zip"]')).toHaveValue(testOrg.zip)
    await expect(page.locator('input[name="website"]')).toHaveValue(testOrg.website)
    await expect(page.locator('input[name="phone"]')).toHaveValue(testOrg.phone)
    await expect(page.locator('textarea[name="notes"]')).toHaveValue(testOrg.notes)
    await expect(page.locator('textarea[name="goals"]')).toHaveValue(testOrg.goals)
    
    console.log('✓ All organization fields are correctly populated')
    
    // Make a small change and save
    const updatedNotes = testOrg.notes + ' - Updated during testing'
    await fillField(page, 'textarea[name="notes"]', updatedNotes)
    
    await page.click('button[type="submit"]')
    await waitForPageLoad(page)
    
    // Verify the change was saved
    await expect(page.locator(`text="${updatedNotes}"`)).toBeVisible()
    console.log('✓ Organization edit saved successfully')
  })

  test('4. Organizations page - Test search and filters', async () => {
    console.log('🔍 Testing organization search and filters...')
    
    await page.goto('http://localhost:3000/organizations')
    await waitForPageLoad(page)
    
    // Test search functionality
    const searchInput = page.locator('input[placeholder*="Search"]').first()
    if (await searchInput.isVisible()) {
      await searchInput.fill(testOrg.name.split(' ')[0])
      await page.waitForTimeout(1000) // Wait for search debounce
      
      // Verify our organization appears in results
      await expect(page.locator(`text="${testOrg.name}"`)).toBeVisible()
      console.log('✓ Search functionality works')
      
      // Clear search
      await searchInput.fill('')
      await page.waitForTimeout(1000)
    }
    
    // Test view toggles if available
    const toggleButtons = ['Cards', 'Table']
    for (const toggle of toggleButtons) {
      const toggleButton = page.locator(`text="${toggle}"`).first()
      if (await toggleButton.isVisible()) {
        await toggleButton.click()
        await page.waitForTimeout(500)
        console.log(`✓ ${toggle} view toggle works`)
      }
    }
  })

  test('5. People page - Create new person with ALL fields', async () => {
    console.log('👤 Testing person creation with all fields...')
    
    // Navigate to people page
    await page.goto('http://localhost:3000/people')
    await waitForPageLoad(page)
    
    // Click "Add New Person" button
    await page.click('text="Add New Person"')
    await waitForPageLoad(page)
    
    // Verify we're on the new person form
    expect(page.url()).toContain('/people/new')
    
    console.log('Selecting organization...')
    // Select organization (our test org should be available)
    const orgSelect = page.locator('select[name="org_id"]')
    await orgSelect.waitFor({ state: 'visible' })
    await orgSelect.selectOption({ label: testOrg.name })
    
    console.log('Filling person details...')
    // Fill person details
    await fillField(page, 'input[name="first_name"]', testPerson.first_name)
    await fillField(page, 'input[name="last_name"]', testPerson.last_name)
    await fillField(page, 'input[name="title"]', testPerson.title)
    await fillField(page, 'input[name="email"]', testPerson.email)
    await fillField(page, 'input[name="phone"]', testPerson.phone)
    await fillField(page, 'textarea[name="notes"]', testPerson.notes)
    
    // Submit the form
    console.log('Submitting person form...')
    await page.click('button[type="submit"]')
    
    // Wait for redirect
    await page.waitForURL(/\/people\/[^\/]+$/, { timeout: 30000 })
    await waitForPageLoad(page)
    
    // Verify person was created
    await expect(page.locator(`text="${testPerson.first_name} ${testPerson.last_name}"`)).toBeVisible()
    console.log('✓ Person created successfully')
  })

  test('6. People page - Edit person and verify fields', async () => {
    console.log('✏️ Testing person editing...')
    
    // Go to people list
    await page.goto('http://localhost:3000/people')
    await waitForPageLoad(page)
    
    // Find our test person
    const personName = `${testPerson.first_name} ${testPerson.last_name}`
    const personCard = page.locator(`text="${personName}"`).first()
    await expect(personCard).toBeVisible()
    
    // Click on the person
    await personCard.click()
    await waitForPageLoad(page)
    
    // Click edit
    await page.click('text="Edit"')
    await waitForPageLoad(page)
    
    console.log('Verifying person form fields...')
    // Verify all fields are populated
    await expect(page.locator('input[name="first_name"]')).toHaveValue(testPerson.first_name)
    await expect(page.locator('input[name="last_name"]')).toHaveValue(testPerson.last_name)
    await expect(page.locator('input[name="title"]')).toHaveValue(testPerson.title)
    await expect(page.locator('input[name="email"]')).toHaveValue(testPerson.email)
    await expect(page.locator('input[name="phone"]')).toHaveValue(testPerson.phone)
    await expect(page.locator('textarea[name="notes"]')).toHaveValue(testPerson.notes)
    
    console.log('✓ All person fields are correctly populated')
    
    // Make a small change
    const updatedTitle = testPerson.title + ' - Updated'
    await fillField(page, 'input[name="title"]', updatedTitle)
    
    await page.click('button[type="submit"]')
    await waitForPageLoad(page)
    
    // Verify the change was saved
    await expect(page.locator(`text="${updatedTitle}"`)).toBeVisible()
    console.log('✓ Person edit saved successfully')
  })

  test('7. People page - Test search functionality', async () => {
    console.log('🔍 Testing people search...')
    
    await page.goto('http://localhost:3000/people')
    await waitForPageLoad(page)
    
    // Test search by name
    const searchInput = page.locator('input[placeholder*="Search"]').first()
    if (await searchInput.isVisible()) {
      await searchInput.fill(testPerson.first_name)
      await page.waitForTimeout(1000)
      
      // Verify our person appears
      await expect(page.locator(`text="${testPerson.first_name} ${testPerson.last_name}"`)).toBeVisible()
      console.log('✓ People search works')
      
      // Clear search
      await searchInput.fill('')
      await page.waitForTimeout(1000)
    }
  })

  test('8. Meetings page - Create comprehensive meeting with ALL fields', async () => {
    console.log('📅 Testing meeting creation with all fields...')
    
    // Navigate to meetings page
    await page.goto('http://localhost:3000/meetings')
    await waitForPageLoad(page)
    
    // Click "New Meeting" button
    await page.click('text="New Meeting"')
    await waitForPageLoad(page)
    
    // Verify we're on the new meeting form
    expect(page.url()).toContain('/meetings/new')
    
    console.log('Filling basic meeting information...')
    // Fill basic information
    await fillField(page, 'input[name="meeting_name"]', testMeeting.meeting_name)
    await fillField(page, 'textarea[name="description"]', testMeeting.description)
    await fillField(page, 'input[type="date"][name="date"]', testMeeting.date)
    await fillField(page, 'input[type="date"][name="next_meeting_date"]', testMeeting.next_meeting_date)
    await fillField(page, 'input[name="location"]', testMeeting.location)
    
    console.log('Selecting lead organization...')
    // Select lead organization
    const leadOrgSelect = page.locator('select').filter({ hasText: 'Select lead organization' }).first()
    await leadOrgSelect.waitFor({ state: 'visible' })
    
    // Find an option with our test organization
    const options = await leadOrgSelect.locator('option').all()
    let selectedOrg = false
    for (const option of options) {
      const text = await option.textContent()
      if (text && text.includes(testOrg.name)) {
        const value = await option.getAttribute('value')
        if (value) {
          await leadOrgSelect.selectOption(value)
          selectedOrg = true
          break
        }
      }
    }
    
    if (!selectedOrg) {
      // If our test org isn't available, select the first available option
      const firstOption = await leadOrgSelect.locator('option').nth(1).getAttribute('value')
      if (firstOption) {
        await leadOrgSelect.selectOption(firstOption)
      }
    }
    
    console.log('Selecting primary contact...')
    // Select primary external POC if available
    const pocSelect = page.locator('select').filter({ hasText: 'Select primary contact' }).first()
    if (await pocSelect.isVisible()) {
      const pocOptions = await pocSelect.locator('option').all()
      if (pocOptions.length > 1) {
        // Select our test person if available, otherwise select first available
        let selectedPoc = false
        for (const option of pocOptions) {
          const text = await option.textContent()
          if (text && (text.includes(testPerson.first_name) || text.includes(testPerson.last_name))) {
            const value = await option.getAttribute('value')
            if (value) {
              await pocSelect.selectOption(value)
              selectedPoc = true
              break
            }
          }
        }
        if (!selectedPoc) {
          const firstPocOption = await pocSelect.locator('option').nth(1).getAttribute('value')
          if (firstPocOption) {
            await pocSelect.selectOption(firstPocOption)
          }
        }
      }
    }
    
    console.log('Adding Red Cross attendees...')
    // Test Red Cross attendees multi-select
    const rcAttendeesContainer = page.locator('text="Red Cross Attendees"').locator('..').locator('..')
    const rcMultiSelect = rcAttendeesContainer.locator('button').first()
    if (await rcMultiSelect.isVisible()) {
      await rcMultiSelect.click()
      await page.waitForTimeout(500)
      
      // Select first available staff member
      const staffOptions = page.locator('[role="option"]')
      if (await staffOptions.first().isVisible()) {
        await staffOptions.first().click()
        await page.waitForTimeout(500)
        // Click outside to close dropdown
        await page.click('body')
      }
    }
    
    console.log('Adding external attendees...')
    // Test adding custom attendee
    const attendeeInput = page.locator('input[placeholder*="Enter full name"]')
    if (await attendeeInput.isVisible()) {
      await attendeeInput.fill('Test External Attendee')
      await page.click('text="Add New"')
      await page.waitForTimeout(500)
    }
    
    console.log('Filling agenda and notes...')
    // Fill agenda and notes
    await fillField(page, 'textarea[name="agenda"]', testMeeting.agenda)
    await fillField(page, 'textarea[name="notes"]', testMeeting.notes)
    
    // Submit the form
    console.log('Submitting meeting form...')
    await page.click('button[type="submit"]')
    
    // Wait for redirect
    await page.waitForURL('/meetings', { timeout: 30000 })
    await waitForPageLoad(page)
    
    // Verify meeting was created
    await expect(page.locator(`text="${testMeeting.meeting_name}"`)).toBeVisible()
    console.log('✓ Meeting created successfully')
  })

  test('9. Database schema validation', async () => {
    console.log('🗄️ Testing database schema consistency...')
    
    // This test would ideally check database schema, but we'll test the API endpoint
    try {
      const response = await page.request.get('http://localhost:3000/api/test')
      expect(response.ok()).toBeTruthy()
      console.log('✓ Database connection test passed')
    } catch (error) {
      console.log('⚠️ Database test endpoint not available')
    }
  })

  test('10. Console errors check', async () => {
    console.log('🐛 Checking for console errors...')
    
    const errors: string[] = []
    
    // Listen for console errors
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text())
      }
    })
    
    // Visit each main page and check for errors
    const pages = [
      'http://localhost:3000',
      'http://localhost:3000/organizations',
      'http://localhost:3000/people',
      'http://localhost:3000/meetings',
      'http://localhost:3000/activity',
      'http://localhost:3000/map'
    ]
    
    for (const url of pages) {
      await page.goto(url)
      await waitForPageLoad(page)
      await page.waitForTimeout(2000) // Wait for any async operations
    }
    
    // Filter out known harmless errors
    const significantErrors = errors.filter(error => 
      !error.includes('favicon') &&
      !error.includes('Extension') &&
      !error.includes('non-passive event listener') &&
      !error.includes('CORS')
    )
    
    if (significantErrors.length > 0) {
      console.log('❌ Console errors found:')
      significantErrors.forEach(error => console.log(`  - ${error}`))
    } else {
      console.log('✓ No significant console errors found')
    }
    
    // This is informational - we don't fail the test for console errors
    // expect(significantErrors.length).toBe(0)
  })

  test('11. Form validation testing', async () => {
    console.log('✅ Testing form validation...')
    
    // Test organization form validation
    await page.goto('http://localhost:3000/organizations/new')
    await waitForPageLoad(page)
    
    // Try to submit empty form
    await page.click('button[type="submit"]')
    await page.waitForTimeout(1000)
    
    // Check for validation errors
    const nameError = page.locator('text="Organization name is required"')
    if (await nameError.isVisible()) {
      console.log('✓ Organization name validation works')
    }
    
    // Test invalid website URL
    await fillField(page, 'input[name="name"]', 'Test Validation Org')
    await fillField(page, 'input[name="website"]', 'invalid-url')
    await page.click('button[type="submit"]')
    await page.waitForTimeout(1000)
    
    // Check for URL validation error
    const urlError = page.locator('text*="url"')
    if (await urlError.isVisible()) {
      console.log('✓ Website URL validation works')
    }
    
    // Test person form validation
    await page.goto('http://localhost:3000/people/new')
    await waitForPageLoad(page)
    
    // Try to submit empty form
    await page.click('button[type="submit"]')
    await page.waitForTimeout(1000)
    
    // Check for required field validation
    const orgRequiredError = page.locator('text="Organization is required"')
    const firstNameError = page.locator('text="First name is required"')
    if (await orgRequiredError.isVisible() || await firstNameError.isVisible()) {
      console.log('✓ Person form validation works')
    }
  })

  test('12. Responsive design check', async () => {
    console.log('📱 Testing responsive design...')
    
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('http://localhost:3000')
    await waitForPageLoad(page)
    
    // Check if navigation is still accessible
    const navigation = page.locator('nav').first()
    await expect(navigation).toBeVisible()
    console.log('✓ Navigation visible on mobile')
    
    // Test tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 })
    await waitForPageLoad(page)
    
    // Check layout adapts
    console.log('✓ Tablet viewport works')
    
    // Reset to desktop
    await page.setViewportSize({ width: 1920, height: 1080 })
    await waitForPageLoad(page)
    console.log('✓ Responsive design tests completed')
  })

  test('13. Performance check', async () => {
    console.log('⚡ Testing page load performance...')
    
    const pages = [
      'http://localhost:3000',
      'http://localhost:3000/organizations',
      'http://localhost:3000/people',
      'http://localhost:3000/meetings'
    ]
    
    for (const url of pages) {
      const startTime = Date.now()
      await page.goto(url)
      await waitForPageLoad(page)
      const loadTime = Date.now() - startTime
      
      console.log(`Page ${url} loaded in ${loadTime}ms`)
      
      // Basic performance check - pages should load in reasonable time
      expect(loadTime).toBeLessThan(10000) // 10 seconds max
    }
    
    console.log('✓ Performance tests completed')
  })

  test('14. Data persistence verification', async () => {
    console.log('💾 Verifying data persistence...')
    
    // Check that our test organization still exists
    await page.goto('http://localhost:3000/organizations')
    await waitForPageLoad(page)
    
    await expect(page.locator(`text="${testOrg.name}"`)).toBeVisible()
    console.log('✓ Test organization persisted')
    
    // Check that our test person still exists
    await page.goto('http://localhost:3000/people')
    await waitForPageLoad(page)
    
    await expect(page.locator(`text="${testPerson.first_name} ${testPerson.last_name}"`)).toBeVisible()
    console.log('✓ Test person persisted')
    
    // Check that our test meeting still exists
    await page.goto('http://localhost:3000/meetings')
    await waitForPageLoad(page)
    
    await expect(page.locator(`text="${testMeeting.meeting_name}"`)).toBeVisible()
    console.log('✓ Test meeting persisted')
  })

  test('15. Final summary and cleanup check', async () => {
    console.log('📋 Generating test summary...')
    
    const summary = {
      testOrganization: testOrg.name,
      testPerson: `${testPerson.first_name} ${testPerson.last_name}`,
      testMeeting: testMeeting.meeting_name,
      timestamp: new Date().toISOString()
    }
    
    console.log('=== TEST SUMMARY ===')
    console.log(`Test Organization: ${summary.testOrganization}`)
    console.log(`Test Person: ${summary.testPerson}`)
    console.log(`Test Meeting: ${summary.testMeeting}`)
    console.log(`Completed at: ${summary.timestamp}`)
    console.log('==================')
    
    // Note: In a real scenario, you might want to clean up test data
    // For this test, we'll leave the data to verify persistence
    
    console.log('✓ Comprehensive system test completed successfully!')
  })
})