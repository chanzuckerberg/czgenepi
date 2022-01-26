import { PlaywrightTestConfig } from "@playwright/test";
const config: PlaywrightTestConfig = {
  timeout: 60000,
  use: {
    screenshot: "only-on-failure",
    ignoreHTTPSErrors: true,
  },
};
export default config;
