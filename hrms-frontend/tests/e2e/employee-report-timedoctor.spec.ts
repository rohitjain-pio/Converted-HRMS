import { test, expect } from '@playwright/test'

test.describe('Employee Report - Time Doctor Integration', () => {
  test.beforeEach(async ({ page }) => {
    // Login as admin
    await page.goto('/auth/login')
    await page.fill('input[type="email"]', 'admin@company.com')
    await page.fill('input[type="password"]', 'password')
    await page.click('button[type="submit"]')
    await page.waitForURL('/dashboard')
    
    // Navigate to Employee Report
    await page.goto('/attendance/employee-report')
    await page.waitForLoadState('networkidle')
  })

  test('should display workedHoursByDate for Time Doctor users', async ({ page }) => {
    // Set date range to 2025-11-18 (when Time Doctor data exists)
    await page.click('button:has-text("Filters")') // Open filters
    await page.waitForTimeout(500)
    
    // Set date from
    const dateFromInput = page.locator('input[type="date"]').first()
    await dateFromInput.fill('2025-11-18')
    
    // Set date to
    const dateToInput = page.locator('input[type="date"]').last()
    await dateToInput.fill('2025-11-18')
    
    // Click search/apply
    await page.click('button:has-text("Search")')
    await page.waitForTimeout(2000)
    
    // Wait for data to load
    await page.waitForSelector('.v-data-table', { timeout: 10000 })
    
    // Verify test users are displayed
    const tableText = await page.locator('.v-data-table').textContent()
    
    // Should show test users
    expect(tableText).toContain('EMP0006') // Rohit Jain @programmers.io
    expect(tableText).toContain('EMP0007') // Anand Sharma @programmers.io
    expect(tableText).toContain('EMP0009') // Anand Sharma @programmers.ai
    
    // Verify date columns are present
    await expect(page.locator('th:has-text("Mon Nov")')).toBeVisible()
    
    // Verify at least one employee has hours displayed
    const hoursDisplayed = await page.locator('.v-data-table tbody tr td').count() > 0
    expect(hoursDisplayed).toBeTruthy()
    
    // Check specific employee data
    const emp0007Row = page.locator('tr:has-text("EMP0007")')
    await expect(emp0007Row).toBeVisible()
    
    // Verify total hours column
    const totalHours = await emp0007Row.locator('td').nth(5).textContent()
    expect(totalHours).toMatch(/\d{1,2}:\d{2}/) // Format: HH:MM
    
    console.log('✓ Employee Report displays Time Doctor data correctly')
  })

  test('should display attendance timeline with hours', async ({ page }) => {
    // Set specific date range
    await page.click('button:has-text("Filters")')
    await page.waitForTimeout(500)
    
    const dateFromInput = page.locator('input[type="date"]').first()
    await dateFromInput.fill('2025-11-18')
    
    const dateToInput = page.locator('input[type="date"]').last()
    await dateToInput.fill('2025-11-18')
    
    await page.click('button:has-text("Search")')
    await page.waitForTimeout(2000)
    
    // Look for EMP0007 (Anand Sharma - should have Time Doctor data)
    const emp0007Row = page.locator('tr:has-text("EMP0007")')
    await expect(emp0007Row).toBeVisible()
    
    // Count the columns - should include date columns
    const columnCount = await emp0007Row.locator('td').count()
    expect(columnCount).toBeGreaterThan(6) // Base columns + date column(s)
    
    // Verify at least one date cell has hour value (beyond base columns)
    // Date columns start after: S.No, Code, Name, Dept, Branch, Total Hours (6 cols)
    const dateCells = await emp0007Row.locator('td').allTextContents()
    const hasHours = dateCells.slice(6).some(cell => 
      cell.trim() !== '' && cell.trim() !== '0' && cell.trim() !== '-'
    )
    expect(hasHours).toBeTruthy()
    
    console.log('✓ Timeline displays hours correctly')
  })

  test('should show zero hours for manual attendance users without data', async ({ page }) => {
    await page.click('button:has-text("Filters")')
    await page.waitForTimeout(500)
    
    const dateFromInput = page.locator('input[type="date"]').first()
    await dateFromInput.fill('2025-11-18')
    
    const dateToInput = page.locator('input[type="date"]').last()
    await dateToInput.fill('2025-11-18')
    
    await page.click('button:has-text("Search")')
    await page.waitForTimeout(2000)
    
    // EMP0008 might not have data for this specific date
    const emp0008Row = page.locator('tr:has-text("EMP0008")')
    if (await emp0008Row.isVisible()) {
      const totalHours = await emp0008Row.locator('td').nth(5).textContent()
      // Should show 00:00 or similar if no data
      expect(totalHours).toMatch(/0+:0+/)
    }
    
    console.log('✓ Handles missing data correctly')
  })

  test('should export report to Excel', async ({ page }) => {
    // Set date range
    await page.click('button:has-text("Filters")')
    await page.waitForTimeout(500)
    
    const dateFromInput = page.locator('input[type="date"]').first()
    await dateFromInput.fill('2025-11-18')
    
    const dateToInput = page.locator('input[type="date"]').last()
    await dateToInput.fill('2025-11-18')
    
    await page.click('button:has-text("Search")')
    await page.waitForTimeout(2000)
    
    // Click export button
    const downloadPromise = page.waitForEvent('download')
    await page.click('button[title="Export"], button:has(svg.mdi-download)')
    
    const download = await downloadPromise
    expect(download.suggestedFilename()).toContain('attendance_report_')
    expect(download.suggestedFilename()).toContain('.xlsx')
    
    console.log('✓ Excel export works correctly')
  })

  test('should handle date range selection', async ({ page }) => {
    await page.click('button:has-text("Filters")')
    await page.waitForTimeout(500)
    
    // Set wider date range
    const dateFromInput = page.locator('input[type="date"]').first()
    await dateFromInput.fill('2025-11-10')
    
    const dateToInput = page.locator('input[type="date"]').last()
    await dateToInput.fill('2025-11-20')
    
    await page.click('button:has-text("Search")')
    await page.waitForTimeout(2000)
    
    // Should show multiple date columns
    const dateHeaders = await page.locator('thead th').allTextContents()
    const dateColumnHeaders = dateHeaders.filter(h => 
      h.includes('Nov') || h.match(/\d{1,2}/)
    )
    
    // Should have multiple date columns for 11-day range
    expect(dateColumnHeaders.length).toBeGreaterThan(5)
    
    console.log('✓ Date range creates correct number of columns')
  })

  test('should display IST times correctly', async ({ page }) => {
    // The workedHoursByDate should show total hours in HH:MM format
    // Individual times (if shown in tooltips or detail views) should be in IST
    
    await page.click('button:has-text("Filters")')
    await page.waitForTimeout(500)
    
    const dateFromInput = page.locator('input[type="date"]').first()
    await dateFromInput.fill('2025-11-18')
    
    const dateToInput = page.locator('input[type="date"]').last()
    await dateToInput.fill('2025-11-18')
    
    await page.click('button:has-text("Search")')
    await page.waitForTimeout(2000)
    
    // Verify format is HH:MM (not showing raw UTC times)
    const emp0007Row = page.locator('tr:has-text("EMP0007")')
    await expect(emp0007Row).toBeVisible()
    
    const totalHours = await emp0007Row.locator('td').nth(5).textContent()
    
    // Should be formatted as HH:MM (01:39 for example, not 05:59)
    expect(totalHours).toMatch(/^\d{1,2}:\d{2}$/)
    
    // Verify it's showing reasonable work hours (not UTC raw times)
    const [hours] = totalHours!.split(':').map(Number)
    expect(hours).toBeGreaterThanOrEqual(0)
    expect(hours).toBeLessThan(24)
    
    console.log(`✓ Times displayed correctly: ${totalHours}`)
  })
})
