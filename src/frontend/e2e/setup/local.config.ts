import { PlaywrightTestConfig } from "@playwright/test";
import { devices } from '@playwright/test';
import dotenv from 'dotenv';

dotenv.config();

const config: PlaywrightTestConfig = {
  testDir: '../tests',
  timeout: 30000,
  expect: {
    timeout: 30000,
  },
  reporter: [ ['html', {open: 'never'} ] ],
  globalSetup: './global-setup',
  use: {
    baseURL: "http://frontend.genepinet.localdev:8000/",
    storageState: 'playwright/storage/state.json',
    actionTimeout: 0,
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
