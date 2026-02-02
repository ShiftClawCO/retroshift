import { test, expect } from '@playwright/test'

test.describe('Homepage', () => {
  test('should display landing page', async ({ page }) => {
    await page.goto('/')
    
    // Check main elements
    await expect(page.locator('h1')).toContainText('RetroShift')
    await expect(page.locator('text=Crea una Retro')).toBeVisible()
    await expect(page.locator('text=Come funziona')).toBeVisible()
  })

  test('should navigate to create page', async ({ page }) => {
    await page.goto('/')
    
    await page.click('text=Crea una Retro')
    
    await expect(page).toHaveURL('/create')
    await expect(page.locator('h1')).toContainText('Crea una nuova Retro')
  })
})
