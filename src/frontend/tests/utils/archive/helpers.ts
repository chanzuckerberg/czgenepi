import { expect, Page, test, TestInfo } from "@playwright/test";
import ENV from "src/common/constants/ENV";
import nodeEnv from "src/common/constants/nodeEnv";

export const TIMEOUT_MS = 30 * 1000;
export const getByTestID = (id: string): string => `[data-test-id="${id}"]`;
export const getByText = (text: string): string => `text=${text}`;
export const getByClassName = (className: string): string => `css=${className}`;
export const getByID = (id: string): string => `[id="${id}"]`;
export const getByName = (name: string): string => `[name="${name}"]`;

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

export async function filterGenomeRecovery(
  option: string,
  page: Page
): Promise<void> {
  await page.waitForURL("https://staging.czgenepi.org/data/samples");
  await page.waitForTimeout(1000);
  await page.click("button[label='Genome Recovery']");
  await page
    .locator("div[role='tooltip'] li span.primary-text", {
      hasText: `${option}`,
    })
    .click();
}

export async function getSampleStatuses(
  page: Page,
  desireStatus: string
): Promise<void> {
  const statuses = await page.$$eval(
    "div[data-test-id='sample-status']",
    (list) => list.map((element) => element.textContent)
  );
  let counter = 0;
  for (let i = 0; i < statuses.length; i++) {
    if (statuses[i] == desireStatus) {
      counter++;
    }
  }
  await expect(statuses).toHaveLength(counter);
  console.log("CURRENT STATUSES FILTERED: " + statuses);
}

export async function filterLineage(page: Page, lineages: string[]) {
  let actualLineage = 0;
  while (actualLineage < lineages.length) {
    await page.click("button[label='Lineage']");
    await page.type(
      "div[data-test-id='sample-status']",
      lineages[actualLineage]
    );
    await page.click("ul[role='listbox'] > li:first-of-type");
    await page.keyboard.press("Escape");
    const filterOn = await page.locator("div > .MuiChip-deletable");
    await expect(filterOn).toHaveText(lineages[actualLineage]);
    const filteredLineages = await page.$$eval(
      "div[data-test-id='table-row'] > div:nth-of-type(4) > div",
      (list) => list.map((element) => element.textContent)
    );
    let counter = 0;
    for (let i = 0; i < filteredLineages.length; i++) {
      if (filteredLineages[i] == lineages[actualLineage]) {
        counter++;
      }
    }
    await expect(filteredLineages).toHaveLength(counter);
    console.log("CURRENT STATUSES FILTERED: " + filteredLineages);
    await page.click("svg.MuiChip-deleteIcon");
    actualLineage++;
  }
}

export async function filterCollectionDate(page: Page, filterDate: string) {
  await page.click("button[label='Collection Date']");
  const periods = await page.locator("div[style*='194'] span > span");
  periods.filter({ hasText: filterDate }).click();
  const filterOn = await page.locator("div > .MuiChip-deletable");
  await expect(filterOn).toHaveText(filterDate);
  await page.waitForTimeout(4000);
}
