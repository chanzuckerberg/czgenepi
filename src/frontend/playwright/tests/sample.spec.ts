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

const sampleData = [
  "20SCPH11281",
  "hCoV-19/USA/ADMIN-18181/2022",
  "A",
  "2022-07-10",
  "2022-07-18",
  "San Mateo County",
  "2022-07-12",
  "Not Found"
];

const sampleDataWithIds: Record<string, string> = {
  "row-publicId": "hCoV-19/USA/ADMIN-18181/2022",
  "row-collectionDate": "2022-07-10",
  "row-collectionLocation": "San Mateo County",
  "row-sequencingDate": "2022-07-12"
};

test.describe("Samples page tests", () => {
    test("Should verify sample listing", async ({page,}: { page: Page }) => {
      await page.goto('https://staging.czgenepi.org/data/samples');
      tableHeaders.forEach((header) => {
        expect(page.locator(getByText(header)).first()).not.toBeEmpty();
      })
      await expect(page.locator(getByTestID("data-menu-item"))).toHaveCount(
        TAB_COUNT
      );
    });

    test.only("Should verify sample data", async ({page,}: { page: Page }) => {
      await page.goto('https://staging.czgenepi.org/data/samples');
      
      //wait until data is displayed
      await page.waitForSelector('[data-test-id="table-row"]') 
      
      const firstRow = await page.locator('[data-test-id="table-row"]').first();
      const divs = await firstRow.locator('div')

      console.log("**************")
      console.log(await divs.count());
      expect(await firstRow.locator('[data-test-id="row-publicId"]').first()).not.toBeEmpty()

      // sampleData.forEach((data) => {
      //   expect(
      //      page.locator('div', {hasText: data}).first()).not.toBeEmpty();
      // });
  });
});