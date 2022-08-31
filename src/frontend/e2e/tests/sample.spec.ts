import { expect, Page, test } from "@playwright/test";
import { getByTestID, getByText } from "../utils/selectors";

const TAB_COUNT = 2;

const tableHeaders = [
  "Private ID",
  "Public ID",
  "Collection Date",
  "Lineage",
  "Upload Date",
  "Collection Location",
  "Sequencing Date",
  "GISAID",
];

test.describe("Samples page tests", () => {
  test.beforeEach(async ({ page }, testInfo) => {
    console.log(`Running ${testInfo.title}`);
    await page.goto("https://staging.czgenepi.org/data/samples");
  });
  test("Should verify sample listing", async ({ page }: { page: Page }) => {
    tableHeaders.forEach((header) => {
      expect(page.locator(getByText(header)).first()).not.toBeEmpty();
    });
    await expect(page.locator(getByTestID("data-menu-item"))).toHaveCount(
      TAB_COUNT
    );
  });

  test("Should verify sample data", async ({ page }: { page: Page }) => {
    //wait until data is displayed
    await page.waitForSelector('[data-test-id="table-row"]');

    // assert table is populated with at least one record
    expect(
      await page.locator(getByTestID("table-row")).count()
    ).toBeGreaterThan(0);
  });
});
