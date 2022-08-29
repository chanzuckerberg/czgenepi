import { PlaywrightTestConfig } from "@playwright/test";

const config: PlaywrightTestConfig = {
  timeout: 40000,
  retries: 0,
  use: {
    actionTimeout: 15000,
    headless: true,
    ignoreHTTPSErrors: true,
    screenshot: "off",
    video: "off",
    viewport: {
      width: 1600,
      height: 1200,
    },
  },
};
export default config;
