import { test, expect } from '@playwright/test'

test.describe('Dashboard', () => {
  let retroCode: string

  test.beforeEach(async ({ page }) => {
    // Create a retro
    await page.goto('/create')
    await page.fill('input[id="title"]', 'Dashboard Test Retro')
    await page.click('button[type="submit"]')
    
    await page.waitForURL(/\/dashboard\/[a-z0-9]+/)
    const url = page.url()
    retroCode = url.split('/').pop() || ''
  })

  test('should show empty state with share instructions', async ({ page }) => {
    await page.goto(`/dashboard/${retroCode}`)
    
    // Should show share banner
    await expect(page.locator('text=Condividi con il team')).toBeVisible()
    await expect(page.locator('text=0 feedback ricevuti')).toBeVisible()
  })

  test('should copy share link', async ({ page }) => {
    await page.goto(`/dashboard/${retroCode}`)
    
    // Click copy button
    await page.click('text=Copia link per il team')
    
    // Should show copied confirmation
    await expect(page.locator('text=Copiato!')).toBeVisible()
  })

  test('should close and reopen retro', async ({ page }) => {
    await page.goto(`/dashboard/${retroCode}`)
    
    // Close retro
    await page.click('text=Chiudi retro')
    
    // Should show closed state
    await expect(page.locator('text=Questa retro è chiusa')).toBeVisible()
    await expect(page.locator('text=Riapri')).toBeVisible()
    
    // Reopen
    await page.click('text=Riapri')
    
    // Should be open again
    await expect(page.locator('text=Chiudi retro')).toBeVisible()
  })

  test('closed retro should not accept feedback', async ({ page }) => {
    // Close the retro first
    await page.goto(`/dashboard/${retroCode}`)
    await page.click('text=Chiudi retro')
    
    // Try to access participation page
    await page.goto(`/r/${retroCode}`)
    
    // Should show closed message
    await expect(page.locator('text=Questa retro è stata chiusa')).toBeVisible()
  })

  test('should display feedback when submitted', async ({ page, context }) => {
    // Open dashboard in first page
    await page.goto(`/dashboard/${retroCode}`)
    
    // Submit feedback in a new page (simulating team member)
    const participantPage = await context.newPage()
    await participantPage.goto(`/r/${retroCode}`)
    
    const textareas = participantPage.locator('textarea')
    await textareas.first().fill('This is test feedback from the team')
    await participantPage.click('text=Invia Feedback Anonimo')
    await participantPage.waitForSelector('text=Grazie!')
    
    // Dashboard should show the feedback (may need refresh for non-realtime)
    await page.reload()
    await expect(page.locator('text=This is test feedback from the team')).toBeVisible()
    await expect(page.locator('text=1 feedback ricevuti')).toBeVisible()
  })
})
