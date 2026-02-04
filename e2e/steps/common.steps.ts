import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { CustomWorld } from '../support/world';

// Navigation
Given('I am on the homepage', async function (this: CustomWorld) {
  await this.page.goto(this.baseUrl);
  await this.page.waitForLoadState('networkidle');
});

Given('I am on the {string} page', async function (this: CustomWorld, pagePath: string) {
  await this.page.goto(`${this.baseUrl}${pagePath}`);
  await this.page.waitForLoadState('networkidle');
});

When('I go to {string}', async function (this: CustomWorld, path: string) {
  await this.page.goto(`${this.baseUrl}${path}`);
  await this.page.waitForLoadState('networkidle');
});

// Clicking
When('I click {string}', async function (this: CustomWorld, text: string) {
  await this.page.getByRole('link', { name: text }).or(
    this.page.getByRole('button', { name: text })
  ).click();
});

When('I click the {string} button', async function (this: CustomWorld, text: string) {
  await this.page.getByRole('button', { name: text }).click();
});

When('I click the {string} link', async function (this: CustomWorld, text: string) {
  await this.page.getByRole('link', { name: text }).click();
});

// Forms
When('I enter {string} in the {string} field', async function (
  this: CustomWorld, 
  value: string, 
  fieldName: string
) {
  await this.page.getByLabel(fieldName).fill(value);
});

When('I select {string} from {string}', async function (
  this: CustomWorld,
  option: string,
  selectName: string
) {
  await this.page.getByLabel(selectName).selectOption(option);
});

// Assertions
Then('I should see {string}', async function (this: CustomWorld, text: string) {
  await expect(this.page.getByText(text)).toBeVisible();
});

Then('I should not see {string}', async function (this: CustomWorld, text: string) {
  await expect(this.page.getByText(text)).not.toBeVisible();
});

Then('I should see the {string} button', async function (this: CustomWorld, text: string) {
  await expect(this.page.getByRole('button', { name: text })).toBeVisible();
});

Then('I should see the {string} link', async function (this: CustomWorld, text: string) {
  await expect(this.page.getByRole('link', { name: text })).toBeVisible();
});

Then('I should be on {string}', async function (this: CustomWorld, path: string) {
  await expect(this.page).toHaveURL(new RegExp(path));
});

Then('the page title should be {string}', async function (this: CustomWorld, title: string) {
  await expect(this.page).toHaveTitle(new RegExp(title));
});

// Debug
When('I wait {int} seconds', async function (this: CustomWorld, seconds: number) {
  await this.page.waitForTimeout(seconds * 1000);
});

When('I take a screenshot', async function (this: CustomWorld) {
  const screenshot = await this.page.screenshot();
  this.attach(screenshot, 'image/png');
});
