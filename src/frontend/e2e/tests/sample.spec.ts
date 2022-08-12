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
  test("Should verify sample listing", async ({ page }: { page: Page }) => {
    await page.goto("https://staging.czgenepi.org/data/samples");
    tableHeaders.forEach((header) => {
      expect(page.locator(getByText(header)).first()).not.toBeEmpty();
    });
    await expect(page.locator(getByTestID("data-menu-item"))).toHaveCount(
      TAB_COUNT
    );
  });
});
