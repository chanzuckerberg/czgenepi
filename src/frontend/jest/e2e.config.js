const config = require(__dirname + "/common.config.js");

module.exports = {
  ...config,
  preset: "jest-playwright-preset",
  setupFilesAfterEnv: [
    "expect-playwright",
    "<rootDir>/jest/playwright.setup.ts",
  ],
  testMatch: ["<rootDir>/tests/**/*.{spec,test}.{js,jsx,ts,tsx,scss}"],
  testRunner: "jest-circus/runner",
};
