import { defineConfig } from "cypress";

export default defineConfig({
  projectId: "rsrcus",
  defaultCommandTimeout: 50000,
  requestTimeout: 50000,
  pageLoadTimeout: 50000,
  chromeWebSecurity: false,
  env: {
    username: "cmoga@contractor.chanzuckerberg.com",
    password: "theAnswerIs42$",
  },
  e2e: {
    baseUrl: "https://staging.czgenepi.org",
    specPattern: 'cypress/e2e/**/*.spec.ts',
    experimentalSessionAndOrigin: true,
    experimentalSourceRewriting: true,
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
  },
});
