const ENV = require(__dirname + "/src/common/constants/ENV.js");

/**
 * `frontend/jest-playwright.config.js` is for configuring Playwright's launch config options
 * `frontend/jest/playwright.setup.ts` is for configuring `jest`, `browser`,
 * and `page` objects
 */

const isHeadful = ENV.HEADFUL === "true" || ENV.HEADLESS === "false";

const DEFAULT_LAUNCH_CONFIG = {
  args: ["--ignore-certificate-errors", "--ignore-ssl-errors"],
  headless: !isHeadful,
  ignoreHTTPSErrors: true,
};

module.exports = {
  browserContext: "incognito",
  launchOptions: DEFAULT_LAUNCH_CONFIG,
};
