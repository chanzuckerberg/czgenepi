import { expect, Page, test, TestInfo } from "@playwright/test";
import ENV from "src/common/constants/ENV";
import nodeEnv from "src/common/constants/nodeEnv";
import { getByTestID, getByText } from "./selectors";

export const TIMEOUT_MS = 30 * 1000;

export async function goToPage(
  page: Page,
  url: string = ENV.FRONTEND_URL as string
): Promise<void> {
  await page.goto(url);
}

export async function screenshot(
  page: Page,
  testInfo: TestInfo
): Promise<void> {
  // NOTE - this currently only supports one screenshot per test
  // All screenshots get uploaded to s3 after a GHA run.
  const filePath = "/tmp/screenshots/" + testInfo.titlePath + ".png";
  await page.screenshot({ path: filePath, fullPage: true });
}

export async function login(page: Page, testInfo: TestInfo): Promise<void> {
  expect(ENV.E2E_USERNAME).toBeDefined();

  goToPage(page);

  try {
    await expect(page.locator(getByTestID("nav-user-menu"))).toBeVisible();
    await screenshot(page, testInfo);
  } catch (error) {
    await page.locator(getByText("Sign in")).first().click();

    await page.fill('[name="Username"], [name="username"]', ENV.E2E_USERNAME);
    await page.fill('[name="Password"], [name="password"]', ENV.E2E_PASSWORD);

    await Promise.all([
      page.waitForNavigation(),
      page.click('[value="login"], [type="submit"]'),
    ]);
  }
}

export const describeIfDeployed = [
  nodeEnv.PRODUCTION,
  nodeEnv.STAGING,
].includes(ENV.DEPLOYMENT_STAGE)
  ? test.describe
  : test.skip;
