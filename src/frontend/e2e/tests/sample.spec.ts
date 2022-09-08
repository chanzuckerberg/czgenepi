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
  test.beforeEach(async ({ page }, workerInfo) => {
    const { baseURL } = workerInfo.config.projects[0].use;
    const url = `${baseURL}` as string;
    await page.goto(`${url}/data/samples`);
  });
  test("Should verify sample listing", async ({ page }: { page: Page }) => {
    tableHeaders.forEach((header) => {
      expect(page.locator(getByText(header)).first()).not.toBeEmpty();
    });
    await expect(page.locator(getByTestID("data-menu-item"))).toHaveCount(
      TAB_COUNT
    );
  });

  test.only("Should verify sample data", async ({ page }: { page: Page }) => {
    await page.goto("https://staging.czgenepi.org/data/samples");

    //wait until data is displayed
    await page.waitForSelector('[data-test-id="table-row"]');
    await expect(page.locator('text="20SCPH11281"')).not.toBeEmpty();
    await expect(
      page.locator('text="hCoV-19/USA/ADMIN-18181/2022"')
    ).not.toBeEmpty();
    await expect(page.locator('text="A"').first()).not.toBeEmpty();
    await expect(page.locator('text="2022-07-10"').first()).not.toBeEmpty();
    await expect(page.locator('text="2022-07-18"').first()).not.toBeEmpty();
    await expect(
      page.locator('text="San Mateo County"').first()
    ).not.toBeEmpty();
    await expect(page.locator('text="2022-07-12"').first()).not.toBeEmpty();
    await expect(page.locator('text="Not Found"').first()).not.toBeEmpty();
  });
});
