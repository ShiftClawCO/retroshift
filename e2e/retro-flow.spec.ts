import { test, expect } from '@playwright/test'

test.describe('Retro Creation Flow', () => {
  test('should create a new retro and show dashboard', async ({ page }) => {
    await page.goto('/create')
    
    // Fill form
    await page.fill('input[id="title"]', 'Test Sprint Retro')
    
    // Select format (default is start-stop-continue)
    await expect(page.locator('text=Start / Stop / Continue')).toBeVisible()
    
    // Submit
    await page.click('button[type="submit"]')
    
    // Should redirect to dashboard
    await expect(page).toHaveURL(/\/dashboard\/[a-z0-9]+/)
    
    // Dashboard should show title and share link
    await expect(page.locator('h1')).toContainText('Test Sprint Retro')
    await expect(page.locator('text=Copia link per il team')).toBeVisible()
  })

  test('should require title to create retro', async ({ page }) => {
    await page.goto('/create')
    
    // Try to submit without title
    await page.click('button[type="submit"]')
    
    // Should show error
    await expect(page.locator('text=Inserisci un titolo')).toBeVisible()
    
    // Should stay on create page
    await expect(page).toHaveURL('/create')
  })

  test('should allow selecting different formats', async ({ page }) => {
    await page.goto('/create')
    
    // Check all formats are visible
    await expect(page.locator('text=Start / Stop / Continue')).toBeVisible()
    await expect(page.locator('text=Mad / Sad / Glad')).toBeVisible()
    await expect(page.locator('text=Liked / Learned / Lacked')).toBeVisible()
    
    // Select Mad/Sad/Glad
    await page.click('text=Mad / Sad / Glad')
    
    // Fill and submit
    await page.fill('input[id="title"]', 'Emotional Retro')
    await page.click('button[type="submit"]')
    
    // Dashboard should show correct format
    await expect(page).toHaveURL(/\/dashboard\/[a-z0-9]+/)
    await expect(page.locator('text=Mad / Sad / Glad')).toBeVisible()
  })
})
