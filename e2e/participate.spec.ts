import { test, expect } from '@playwright/test'

test.describe('Participation Flow', () => {
  let retroCode: string

  test.beforeEach(async ({ page }) => {
    // Create a retro first
    await page.goto('/create')
    await page.fill('input[id="title"]', 'Participation Test Retro')
    await page.click('button[type="submit"]')
    
    // Extract code from URL
    await page.waitForURL(/\/dashboard\/[a-z0-9]+/)
    const url = page.url()
    retroCode = url.split('/').pop() || ''
  })

  test('should load participation page with correct categories', async ({ page }) => {
    await page.goto(`/r/${retroCode}`)
    
    // Check title is shown
    await expect(page.locator('h1')).toContainText('Participation Test Retro')
    
    // Check all categories for start-stop-continue
    await expect(page.locator('text=🚀 Start')).toBeVisible()
    await expect(page.locator('text=🛑 Stop')).toBeVisible()
    await expect(page.locator('text=✅ Continue')).toBeVisible()
    
    // Check submit button
    await expect(page.locator('text=Invia Feedback Anonimo')).toBeVisible()
  })

  test('should submit feedback and show confirmation', async ({ page }) => {
    await page.goto(`/r/${retroCode}`)
    
    // Fill in feedback for one category
    const textareas = page.locator('textarea')
    await textareas.first().fill('We should start doing daily standups')
    
    // Submit
    await page.click('text=Invia Feedback Anonimo')
    
    // Should show confirmation
    await expect(page.locator('text=Grazie!')).toBeVisible()
    await expect(page.locator('text=Il tuo feedback è stato inviato')).toBeVisible()
  })

  test('should require at least one feedback entry', async ({ page }) => {
    await page.goto(`/r/${retroCode}`)
    
    // Try to submit without filling anything
    await page.click('text=Invia Feedback Anonimo')
    
    // Should show error
    await expect(page.locator('text=Scrivi almeno un feedback')).toBeVisible()
  })

  test('should allow adding more feedback after submission', async ({ page }) => {
    await page.goto(`/r/${retroCode}`)
    
    // Submit first feedback
    const textareas = page.locator('textarea')
    await textareas.first().fill('First feedback')
    await page.click('text=Invia Feedback Anonimo')
    
    // Click to add more
    await page.click('text=Aggiungi altro feedback')
    
    // Should be back to form
    await expect(page.locator('text=🚀 Start')).toBeVisible()
  })
})
