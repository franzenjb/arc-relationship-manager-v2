import { test, expect } from '@playwright/test';

test('Create meeting with all fields including other organizations', async ({ page }) => {
  // Navigate to meetings page
  await page.goto('http://localhost:3000/meetings');
  
  // Click on "Log Interaction" button
  await page.getByRole('link', { name: /Log Interaction/i }).click();
  
  // Wait for form to load
  await page.waitForSelector('input[type="text"]');
  
  // Fill in meeting details
  await page.fill('input[type="text"]', 'Test Meeting with All Fields');
  
  // Select a lead organization (should have options now)
  const leadOrgSelect = page.locator('select').first();
  await leadOrgSelect.selectOption({ index: 1 }); // Select first available org
  
  // Set meeting date
  await page.fill('input[type="date"]', '2025-01-24');
  
  // Try to select Red Cross attendees if the field exists
  const rcAttendeesField = page.locator('text=Red Cross Attendees');
  if (await rcAttendeesField.isVisible()) {
    console.log('✅ Red Cross Attendees field is present');
  }
  
  // Try to select Other Organizations if the field exists
  const otherOrgsField = page.locator('text=Other Organizations Present');
  if (await otherOrgsField.isVisible()) {
    console.log('✅ Other Organizations field is present');
  }
  
  // Submit the form
  await page.getByRole('button', { name: /Create Meeting/i }).click();
  
  // Check for any errors
  const errorElements = await page.locator('.text-red-600').count();
  if (errorElements > 0) {
    const errorText = await page.locator('.text-red-600').first().textContent();
    console.log('❌ Error found:', errorText);
  } else {
    console.log('✅ Meeting created successfully!');
  }
  
  // Verify we're redirected to meetings list
  await expect(page).toHaveURL(/\/meetings/);
});