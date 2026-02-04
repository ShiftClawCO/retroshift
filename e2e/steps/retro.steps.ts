import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { CustomWorld } from '../support/world';

// Navigation
Given('I am on the create retro page', async function (this: CustomWorld) {
  await this.page.goto(`${this.baseUrl}/create`);
  await this.page.waitForLoadState('networkidle');
});

When('I go to create retro page', async function (this: CustomWorld) {
  await this.page.goto(`${this.baseUrl}/create`);
  await this.page.waitForLoadState('networkidle');
});

// Dashboard checks
Then('I should be on the dashboard', async function (this: CustomWorld) {
  await expect(this.page).toHaveURL(/\/dashboard\//);
});

Then('I should see the share link', async function (this: CustomWorld) {
  await expect(this.page.getByText(/Copy team link|Copy/i)).toBeVisible();
});

Then('I should see the retro title {string}', async function (this: CustomWorld, title: string) {
  await expect(this.page.getByRole('heading', { name: title })).toBeVisible();
});

// Participation
Given('a retro exists with code {string}', async function (this: CustomWorld, code: string) {
  // TODO: Create test retro via API
  console.log(`⚠️  Setup: Would create retro with code ${code}`);
});

When('I visit {string}', async function (this: CustomWorld, path: string) {
  await this.page.goto(`${this.baseUrl}${path}`);
  await this.page.waitForLoadState('networkidle');
});

When('I enter feedback {string}', async function (this: CustomWorld, feedback: string) {
  // Find textarea and enter feedback
  const textarea = this.page.getByPlaceholder(/feedback|write/i);
  await textarea.fill(feedback);
});

When('I submit feedback', async function (this: CustomWorld) {
  await this.page.getByRole('button', { name: /submit/i }).click();
});

// Limit checks
Then('I should see the limit reached message', async function (this: CustomWorld) {
  await expect(this.page.getByText(/limit|reached|upgrade/i)).toBeVisible();
});

Then('no new retro should be created', async function (this: CustomWorld) {
  // Should still be on create page, not dashboard
  await expect(this.page).toHaveURL(/\/create/);
});

Then('I should NOT see retro count', async function (this: CustomWorld) {
  await expect(this.page.getByText(/of \d+ free retros/i)).not.toBeVisible();
});

Then('I should be able to create a retro', async function (this: CustomWorld) {
  await expect(this.page.getByRole('button', { name: /create retro/i })).toBeEnabled();
});

// My Retros
Then('I should see my retros list', async function (this: CustomWorld) {
  await expect(this.page.getByRole('heading', { name: /my retros/i })).toBeVisible();
});
