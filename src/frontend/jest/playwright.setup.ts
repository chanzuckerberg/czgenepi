/**
 * `frontend/jest-playwright.config.js` is for configuring Playwright's launch config options
 * `jest/playwright.setup.ts` is for configuring `jest`, `browser`, and `page` objects
 */

// (thuang): This is the max time a test can take to run.
// Since when debugging, we run and !headless, this means
// a test can take more time to finish, so we don't want
// jest to shut off the test too soon
jest.setTimeout(2 * 60 * 1000);

// (thuang): Please make sure this number matches
// `RETRY_ATTEMPTS` in `jest/screenshot_env.js` (when we add screenshot)
jest.retryTimes(2);

beforeEach(async () => {
  const client = await page.context().newCDPSession(page);

  await client.send("Animation.setPlaybackRate", {
    // (thuang): Use max playback rate to get the effect of disabling animation
    playbackRate: 12,
  });
});

// (thuang): Avoid error
// error TS1208: 'playwright.setup.ts' cannot be compiled under
// '--isolatedModules' because it is considered a global script file.
// Add an import, export, or an empty 'export {}' statement to make it a module.
export {};
