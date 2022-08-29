import { PlaywrightTestConfig } from "@playwright/test";
import { devices } from "@playwright/test";
import dotenv from "dotenv";

dotenv.config();

const config: PlaywrightTestConfig = {
  expect: {
    timeout: 30000,
  },
  globalSetup: "./global-setup",
  outputDir: "../report",
  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
      },
    },
  ],
  reporter: process.env.CI ? "github" : "list",
  testDir: "../tests",
  timeout: 30000,
  use: {
    actionTimeout: 0,
    baseURL: "https://staging.czgenepi.org",
    ignoreHTTPSErrors: true,
    storageState: "e2e/storage/state.json",
    screenshot: "only-on-failure",
    trace: "on-first-retry",
    viewport: { width: 1280, height: 720 },
  },
};
export default config;
