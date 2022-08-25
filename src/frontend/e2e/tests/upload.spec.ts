import { expect, Page, test } from "@playwright/test";
import { getByTestID, getByText } from "../utils/selectors";
import SampleUtil from "../utils/sample";

test.describe("API tests", () => {
  test.beforeEach(async ({ page }, testInfo) => {
    await page.goto("https://staging.czgenepi.org/data/samples");
  });
  test.only("Should get samples", async ({ page }: { page: Page }) => {
    await SampleUtil.getSamples().then((samples) => {
      console.log("*******************");
      console.log(samples);
      expect(samples.count()).toBeGreaterThan(0);
    });
  });
});
