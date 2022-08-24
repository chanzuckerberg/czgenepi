import { expect, Page, test } from "@playwright/test";
import { getByTestID, getByText } from "../utils/selectors";
import SampleUtil from "../utils/sample";

test.describe("API tests", () => {
  test.beforeEach(async ({ page }, testInfo) => {
    console.log(`Running ${testInfo.title}`);
    await page.goto("https://staging.czgenepi.org/data/samples");
  });
  test.only("Should get samples", async ({ page }: { page: Page }) => {
    const samples = await SampleUtil.getSamples();
    expect(samples.count()).toBeGreaterThan(0);
  });
});
