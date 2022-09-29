import { PlaywrightTestConfig } from "@playwright/test";
import { devices } from "@playwright/test";
import dotenv from "dotenv";
import path from "path";

dotenv.config({
  path: path.resolve(__dirname, "../../", ".env.local"),
});

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
    baseURL: "http://frontend.genepinet.localdev:8000",
    headless: true,
    ignoreHTTPSErrors: true,
    screenshot: "only-on-failure",
    storageState: "/tmp/state.json",
    trace: "on-first-retry",
  },
};
export default config;
