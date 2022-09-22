import { expect, Page, test } from "@playwright/test";
import { getByTestID, getByText } from "../utils/selectors";
import path from "path";
import dotenv from "dotenv";

dotenv.config({ path: path.resolve(`.env.${process.env.NODE_ENV}`) });

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
  test.beforeEach(async ({ page }, workerInfo) => {
    const { baseURL } = workerInfo.config.projects[0].use;
    const url = `${baseURL}` as string;
    await page.goto(`${url}/data/samples`);
    //accept cookie t&c
    await page.locator('text="Accept"').first().click();
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

    //verify for each all attributes are populated
    //elements without test ids excluded until these have been added
    const dataRows = page.locator('[data-test-id="table-row"]');
    for (let i = 0; i < (await dataRows.count()); i++) {
      await expect(
        page.locator('[data-testid="checkbox"]').nth(i)
      ).toBeVisible();
      await expect(
        page.locator('[data-test-id="sample-status"]').nth(i)
      ).not.toBeEmpty();
      await expect(
        page.locator('[data-test-id="row-collectionDate"]').nth(i)
      ).not.toBeEmpty();
      // some test data have no location so we will just verify the element in the DOM
      await expect(
        page.locator('[data-test-id="row-collectionLocation"]').nth(i)
      ).toHaveCount(1);
      await expect(
        page.locator('[data-test-id="row-sequencingDate"]').nth(i)
      ).not.toBeEmpty();
    }
  });
});
