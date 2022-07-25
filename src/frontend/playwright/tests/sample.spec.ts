import { expect, Page, test } from "@playwright/test";
import { getByTestID, getByText } from "../utils/selectors";
import { login } from '../utils/login';

const TAB_COUNT = 2;

const username = process.env.USERNAME ?? '';
const password = process.env.PASSWORD ?? '';


const tableHeaders = [
  'Private ID',
  'Public ID',
  'Collection Date',
  'Lineage',
  'Upload Date',
  'Collection Location',
  'Sequencing Date',
  'GISAID'
]

const sampleDataWithIds: Record<string, string> = {
  "row-publicId": "hCoV-19/USA/ADMIN-18181/2022",
  "row-collectionDate": "2022-07-10",
  "row-collectionLocation": "San Mateo County",
  "row-sequencingDate": "2022-07-12"
};

const sampleDataWithIndex: Record<number, string> = {
  3: "20SCPH11281",
  10: "A",
  11: "2022-07-18",
  17: "Not Found"
};

test.afterEach(async ({ page }) => {
  await page.locator(getByTestID('nav-user-menu')).first().click();
  await page.locator(getByText('Logout')).first().click();
});

test.describe("Samples page tests", () => {
    test("Should verify sample listing", async ({page,}: { page: Page }) => {
      await login(page, username, password);
      tableHeaders.forEach((header) => {
        expect(page.locator(getByText(header)).first()).not.toBeEmpty();
      })
      await expect(page.locator(getByTestID("data-menu-item"))).toHaveCount(
        TAB_COUNT
      );
    });

    test("Should verify sample data", async ({page,}: { page: Page }) => {
      await login(page, username, password); 
      // verify sample attributes test ids    
      Object.keys(sampleDataWithIds).forEach((testId) => {
        expect(
          page.locator(getByTestID(testId)).first()
        ).toHaveText(sampleDataWithIds[testId]);

    // verify sample attributes that have no test ids
    Object.keys(sampleDataWithIndex).forEach((index) => {
      expect(
        page.locator('div').nth(Number(index))
      ).toHaveText(sampleDataWithIds[testId]);
    });
  });
  });
});