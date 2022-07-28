import { defineConfig } from "cypress";

export default defineConfig({
  defaultCommandTimeout: 50000,
  requestTimeout: 50000,
  pageLoadTimeout: 50000,
  e2e: {
    baseUrl: "https://staging.czgenepi.org",
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
  },
});
