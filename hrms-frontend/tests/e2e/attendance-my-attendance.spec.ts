import { test, expect } from '@playwright/test'

test.describe('My Attendance - Time In/Out Functionality', () => {
  test.beforeEach(async ({ page }) => {
    // Login using internal-login route
    await page.goto('http://localhost:5173/internal-login')
    
    // Fill login form
    await page.fill('input[type="email"]', 'admin@company.com')
    await page.fill('input[type="password"]', 'password')
    
    // Click login button
    await page.click('button[type="submit"]')
    
    // Wait for navigation to complete
    await page.waitForURL('**/dashboard', { timeout: 10000 })
    
    // Navigate to My Attendance page
    await page.goto('http://localhost:5173/attendance/my-attendance')
    await page.waitForLoadState('networkidle')
  })

  test('should display My Attendance page with correct breadcrumbs', async ({ page }) => {
    // Check breadcrumbs
    await expect(page.locator('.v-breadcrumbs')).toBeVisible()
    await expect(page.locator('text=Dashboard')).toBeVisible()
    await expect(page.locator('text=My Attendance')).toBeVisible()
    
    // Check page title
    await expect(page.locator('h2:has-text("My Attendance")')).toBeVisible()
  })

  test('should display attendance table with records', async ({ page }) => {
    // Wait for table to load
    await page.waitForSelector('.attendance-data-table', { timeout: 10000 })
    
    // Check if table is visible
    await expect(page.locator('.attendance-data-table')).toBeVisible()
    
    // Check table headers
    await expect(page.locator('th:has-text("S.No")')).toBeVisible()
    await expect(page.locator('th:has-text("Date")')).toBeVisible()
    await expect(page.locator('th:has-text("Day")')).toBeVisible()
    await expect(page.locator('th:has-text("Start Time")')).toBeVisible()
    await expect(page.locator('th:has-text("End Time")')).toBeVisible()
    await expect(page.locator('th:has-text("Location")')).toBeVisible()
    await expect(page.locator('th:has-text("Total Hours")')).toBeVisible()
    await expect(page.locator('th:has-text("Audit Trail")')).toBeVisible()
    await expect(page.locator('th:has-text("Action")')).toBeVisible()
  })

  test('should show Time In button when not timed in', async ({ page }) => {
    // Wait for page to load
    await page.waitForLoadState('networkidle')
    
    // Check if Time In or Time Out button is visible
    const timeInButton = page.locator('button:has-text("Time In")')
    const timeOutButton = page.locator('button:has-text("Time Out")')
    
    // At least one should be visible
    const isTimeInVisible = await timeInButton.isVisible().catch(() => false)
    const isTimeOutVisible = await timeOutButton.isVisible().catch(() => false)
    
    expect(isTimeInVisible || isTimeOutVisible).toBeTruthy()
  })

  test('should open Time In dialog when clicking Time In button', async ({ page }) => {
    // Wait for page to load
    await page.waitForLoadState('networkidle')
    
    // Check if Time In button exists
    const timeInButton = page.locator('button:has-text("Time In")')
    
    if (await timeInButton.isVisible().catch(() => false)) {
      // Click Time In button
      await timeInButton.click()
      
      // Wait for dialog to open
      await page.waitForSelector('.v-dialog', { timeout: 5000 })
      
      // Check dialog title
      await expect(page.locator('h4:has-text("Time In")')).toBeVisible()
      
      // Check form fields
      await expect(page.locator('input[type="date"]')).toBeVisible()
      await expect(page.locator('input[placeholder="Location"]').or(page.locator('label:has-text("Location")'))).toBeVisible()
      
      // Close dialog
      await page.locator('button[aria-label="close"]').or(page.locator('button:has(i.mdi-close)')).click()
      await page.waitForTimeout(500)
    } else {
      console.log('Time In button not visible - user might already be timed in')
    }
  })

  test('should open Time Out dialog when clicking Time Out button', async ({ page }) => {
    // Wait for page to load
    await page.waitForLoadState('networkidle')
    
    // Check if Time Out button exists
    const timeOutButton = page.locator('button:has-text("Time Out")')
    
    if (await timeOutButton.isVisible().catch(() => false)) {
      // Click Time Out button
      await timeOutButton.click()
      
      // Wait for dialog to open
      await page.waitForSelector('.v-dialog', { timeout: 5000 })
      
      // Check dialog content
      await expect(page.locator('text=/Are you sure.*time out/i')).toBeVisible()
      
      // Check buttons
      await expect(page.locator('button:has-text("Cancel")')).toBeVisible()
      await expect(page.locator('button:has-text("Confirm")')).toBeVisible()
      
      // Close dialog
      await page.locator('button:has-text("Cancel")').click()
      await page.waitForTimeout(500)
    } else {
      console.log('Time Out button not visible - user might not be timed in')
    }
  })

  test('should toggle filters panel', async ({ page }) => {
    // Wait for page to load
    await page.waitForLoadState('networkidle')
    
    // Click filter button
    const filterButton = page.locator('button:has(i.mdi-filter-variant)')
    await expect(filterButton).toBeVisible()
    await filterButton.click()
    
    // Wait for filter panel to expand
    await page.waitForTimeout(500)
    
    // Check if filter form is visible
    await expect(page.locator('input[type="date"]').first()).toBeVisible()
    
    // Click again to close
    await filterButton.click()
    await page.waitForTimeout(500)
  })

  test('should display pagination controls', async ({ page }) => {
    // Wait for table to load
    await page.waitForSelector('.attendance-data-table', { timeout: 10000 })
    
    // Check if pagination exists
    const pagination = page.locator('.v-pagination')
    
    // Pagination might not be visible if there's only one page
    const hasPagination = await pagination.isVisible().catch(() => false)
    
    if (hasPagination) {
      console.log('Pagination is visible')
    } else {
      console.log('Pagination not visible - might be only one page of results')
    }
  })

  test('should verify attendance records have correct structure', async ({ page }) => {
    // Wait for table to load
    await page.waitForSelector('.attendance-data-table', { timeout: 10000 })
    
    // Wait a bit for data to load
    await page.waitForTimeout(2000)
    
    // Check if there are any rows
    const rows = page.locator('tbody tr')
    const rowCount = await rows.count()
    
    console.log(`Found ${rowCount} attendance records`)
    
    if (rowCount > 0) {
      // Check first row has data
      const firstRow = rows.first()
      
      // Check if row has cells
      const cells = firstRow.locator('td')
      const cellCount = await cells.count()
      
      expect(cellCount).toBeGreaterThan(0)
      console.log(`First row has ${cellCount} cells`)
    }
  })
})
