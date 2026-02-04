import { setWorldConstructor, World, IWorldOptions } from '@cucumber/cucumber';
import { Browser, BrowserContext, Page, chromium } from 'playwright';

export interface CustomWorld extends World {
  browser: Browser;
  context: BrowserContext;
  page: Page;
  baseUrl: string;
  testUser?: {
    email: string;
    id: string;
  };
  init(): Promise<void>;
  cleanup(): Promise<void>;
}

class PlaywrightWorld extends World implements CustomWorld {
  browser!: Browser;
  context!: BrowserContext;
  page!: Page;
  baseUrl: string;
  testUser?: {
    email: string;
    id: string;
  };

  constructor(options: IWorldOptions) {
    super(options);
    this.baseUrl = process.env.BASE_URL || 'http://localhost:3000';
  }

  async init() {
    this.browser = await chromium.launch({
      headless: process.env.HEADLESS !== 'false',
    });
    this.context = await this.browser.newContext();
    this.page = await this.context.newPage();
  }

  async cleanup() {
    await this.page?.close();
    await this.context?.close();
    await this.browser?.close();
  }
}

setWorldConstructor(PlaywrightWorld);
