import ENV from "src/common/constants/ENV";
import nodeEnv from "src/common/constants/nodeEnv";
import { getTestID, getText } from "./selectors";
import { test, expect } from '@playwright/test';

export const TIMEOUT_MS = 30 * 1000;

export async function goToPage(page, 
  url: string = ENV.FRONTEND_URL as string
): Promise<void> {
  await page.goto(url);
}

export async function login(page, testInfo): Promise<void> {
  expect(ENV.E2E_USERNAME).toBeDefined();

  goToPage(page);

  try {
    await expect(page.locator(getTestID("nav-user-menu"))).toBeVisible();
  } catch (error) {
    // 2. logging HTML string here
    // DEBUG
    // DEBUG
    // DEBUG
    //console.log(await page.content());
    // TODO this is horribly broken but we're going to try dropping jest-playwright asap.
    //const title = expect.getState().currentTestName
    //await page.screenshot({ path: '/tmp/screenshots/' + title + '/homepage.png', fullPage: true });

    await page.locator(getText("Sign in")).first().click();

    await page.fill('[name="Username"], [name="username"]', ENV.E2E_USERNAME);
    await page.fill('[name="Password"], [name="password"]', ENV.E2E_PASSWORD);

    await Promise.all([
      page.waitForNavigation(),
      page.click('[value="login"], [type="submit"]'),
    ]);

  }
}

export async function tryUntil(
  assert: () => void,
  maxRetry = 50
): Promise<void> {
  const WAIT_FOR_MS = 200;

  let retry = 0;

  let savedError: Error = new Error();

  while (retry < maxRetry) {
    try {
      await assert();

      break;
    } catch (error) {
      if (error instanceof Error) {
        retry += 1;
        savedError = error;
        await page.waitForTimeout(WAIT_FOR_MS);
      }
    }
  }

  if (retry === maxRetry) {
    savedError.message += " tryUntil() failed";
    throw savedError;
  }
}

export const describeIfDeployed = [
  nodeEnv.PRODUCTION,
  nodeEnv.STAGING,
].includes(ENV.DEPLOYMENT_STAGE)
  ? test.describe
  : test.skip;
