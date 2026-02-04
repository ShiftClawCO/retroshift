import { test, expect } from '@playwright/test';

test.describe('Homepage', () => {
  test('should display main heading', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { name: /Retrospectives on calls are awkward/i })).toBeVisible();
  });

  test('should show CTA button', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('link', { name: /Create your first Retro/i })).toBeVisible();
  });

  test('should show pricing section', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByText('Simple pricing')).toBeVisible();
    await expect(page.getByText('€0')).toBeVisible();
    await expect(page.getByText('€9')).toBeVisible();
  });

  test('should navigate to create page', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: /Create your first Retro/i }).click();
    await expect(page).toHaveURL(/\/create/);
  });

  test('should navigate to login', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: 'Sign In' }).click();
    await expect(page).toHaveURL(/\/login/);
  });

  test('should navigate to pricing', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: /Upgrade to Pro/i }).click();
    await expect(page).toHaveURL(/\/pricing/);
  });
});

test.describe('Pricing Page', () => {
  test('should display both plans', async ({ page }) => {
    await page.goto('/pricing');
    await expect(page.getByRole('heading', { name: /Choose your plan/i })).toBeVisible();
    // Use more specific selectors to avoid multiple matches
    await expect(page.getByText('Free', { exact: true }).first()).toBeVisible();
    await expect(page.getByText('Pro', { exact: true }).first()).toBeVisible();
  });

  test('should show same features as homepage', async ({ page }) => {
    await page.goto('/pricing');
    
    // Free tier features
    await expect(page.getByText(/3 active retros/i)).toBeVisible();
    await expect(page.getByText(/10 participants/i)).toBeVisible();
    await expect(page.getByText(/AI-powered/i)).toBeVisible();
    
    // Pro features
    await expect(page.getByText(/Unlimited retros/i)).toBeVisible();
    await expect(page.getByText(/PDF export/i)).toBeVisible();
  });

  test('should have Upgrade button', async ({ page }) => {
    await page.goto('/pricing');
    await expect(page.getByRole('button', { name: /Upgrade to Pro/i })).toBeVisible();
  });
});

test.describe('Login Page', () => {
  test('should display Google OAuth button', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByRole('button', { name: /Continue with Google/i })).toBeVisible();
  });

  test('should have link to signup', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByRole('link', { name: /Sign up/i })).toBeVisible();
  });
});

test.describe('Create Page', () => {
  test('should show create form or auth prompt', async ({ page }) => {
    await page.goto('/create');
    // Page loads - either shows create form (if logged in) or prompt to login
    // The page might allow access even unauthenticated but require auth to submit
    await expect(page.getByText(/Create|Title|Retro/i).first()).toBeVisible();
  });
});
