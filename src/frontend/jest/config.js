const config = require(__dirname + "/common.config.js");

module.exports = {
  ...config,
  setupFilesAfterEnv: ["<rootDir>/jest/setup.ts"],
  testEnvironment: "jsdom",
  testMatch: ["<rootDir>/**/**/*.test.{js,jsx,ts,tsx}"],
  testPathIgnorePatterns: [
    ...config.testPathIgnorePatterns,
    "<rootDir>/tests/features",
  ],
};
