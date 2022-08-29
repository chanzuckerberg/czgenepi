import { PlaywrightTestConfig } from "@playwright/test";
import { devices } from "@playwright/test";
import dotenv from "dotenv";

dotenv.config();

const config: PlaywrightTestConfig = {
  outputDir: "../report",
  testDir: "../tests",
  expect: {
    timeout: 30000,
  },
  timeout: 30000,
  reporter: process.env.CI ? "github" : "list",
  globalSetup: "./global-setup",
  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
      },
    },
  ],
  use: {
    baseURL: "https://staging.czgenepi.org",
    actionTimeout: 0,
    storageState: "e2e/storage/state.json",
    ignoreHTTPSErrors: true,
    screenshot: "only-on-failure",
    trace: "on-first-retry",
    viewport: { width: 1280, height: 720 },
  },
};
export default config;
