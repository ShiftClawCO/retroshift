import { Before, After, BeforeAll, AfterAll, Status } from '@cucumber/cucumber';
import { CustomWorld } from './world';

// Before each scenario
Before(async function (this: CustomWorld) {
  await this.init();
});

// After each scenario
After(async function (this: CustomWorld, { result }) {
  // Take screenshot on failure
  if (result?.status === Status.FAILED) {
    const screenshot = await this.page.screenshot();
    this.attach(screenshot, 'image/png');
  }
  
  await this.cleanup();
});

// Global setup (once before all tests)
BeforeAll(async function () {
  // Could set up test database here
  console.log('🧪 Starting E2E test suite...');
});

// Global teardown
AfterAll(async function () {
  console.log('✅ E2E test suite complete');
});
