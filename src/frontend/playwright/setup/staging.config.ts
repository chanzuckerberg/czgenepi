import { PlaywrightTestConfig } from "@playwright/test";
import { devices } from '@playwright/test';
import dotenv from 'dotenv';

dotenv.config();

const config: PlaywrightTestConfig = {
  testDir: '../tests',
  timeout: 60000,
  expect: {
    timeout: 60000,
  },
  reporter: [ ['html', {open: 'never'} ] ],
  //globalSetup: './global-setup',
  use: {
    storageState: 'playwright/storage/state.json',
    actionTimeout: 0,
    baseUrl: 'https://staging.czgenepi.org',
    trace: 'on-first-retry',
    screenshot: "only-on-failure",
    ignoreHTTPSErrors: true,
    viewport: {width: 1280, height: 720}
  },
  projects: [
    {
        name: 'chromium',
        use: {
            ...devices['Desktop Chrome']
        }
    }
  ]
};
export default config;
