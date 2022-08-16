import { devices, PlaywrightTestConfig } from "@playwright/test";
//import { devices } from "@playwright/test";
import dotenv from "dotenv";

dotenv.config();

const config: PlaywrightTestConfig = {
  testDir: "../tests",
  timeout: 30000,
  expect: {
    timeout: 30000,
  },
  reporter: [["html", { open: "never" }]],
  globalSetup: "./global-setup",
  use: {
    baseURL: "https://staging.czgenepi.org",
    storageState: "e2e/storage/state.json",
    actionTimeout: 0,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    ignoreHTTPSErrors: true,
    viewport: { width: 1280, height: 720 },
  },
  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
      },
    },
  ],
};
export default config;
