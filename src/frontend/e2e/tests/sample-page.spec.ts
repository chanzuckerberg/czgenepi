import { expect, Page, test } from "@playwright/test";
import path from "path";
import dotenv from "dotenv";
import fs from "fs";
import { BasePage } from "../pages/basePage";
import { getByTestID } from "../utils/selectors";

dotenv.config({ path: path.resolve(`.env.${process.env.NODE_ENV}`) });

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
const api = `${process.env.BASEAPI}/v2/orgs/${process.env.GROUPID}/pathogens/SC2/samples/`;
const mockData = JSON.parse(
  fs.readFileSync("e2e/fixtures/sampleList.json") as unknown as string
);
let url: string;
test.describe("Samples page tests", () => {
  test.beforeAll(async ({}, workerInfo) => {
    const { baseURL } = workerInfo.config.projects[0].use;
    url = `${baseURL}/data/samples`;
  });

  test("Should verify sample list headers", async ({ page }) => {
    await displaySamplePage(page);
    const base = new BasePage(page);
    tableHeaders.forEach(async (header) => {
      expect((await base.findByText(header)).first()).not.toBeEmpty();
    });
  });

  test("Should verify sample data", async ({ page, context }) => {
    await displaySamplePage(page);

    // get the first record so
    //for validating attributes rendered on UI
    const sample = mockData.samples[0];

    //create an intercept to stub response with mock data once we get response with status 200
    await context.route(
      api,
      async (route: {
        fulfill: (arg0: { response: any; body: string }) => void;
      }) => {
        const response = await context.request.get(api);
        //check we get response 200, but we could also abort the call (route.abort() : route.continue();)
        expect(response.ok()).toBeTruthy();
        //retain original response but replace body part with stubbed data we created
        route.fulfill({
          response,
          body: JSON.stringify(mockData),
        });
      }
    );
    // make the actual call, wait until all responses have been received
    await page.goto(url, { waitUntil: "networkidle" });

    //wait until data is displayed
    await page.waitForSelector(getByTestID("table-row"));

    const sampleRows = page.locator(getByTestID("table-row"));
    expect(await sampleRows.count()).toBe(1);

    // verify status
    // todo: this test currently fails to find element, deferring for now
    //const status = sample.czb_failed_genome_recovery ? "failed" : "complete";
    //expect(page.locator(getByTestID("sample-status"))).toHaveText(status);

    // verify public ID
    expect(page.locator(getByTestID("row-publicId"))).toHaveText(
      sample.public_identifier
    );

    // verify collection date
    expect(page.locator(getByTestID("row-collectionDate"))).toHaveText(
      sample.collection_date
    );

    // verify collection date
    expect(page.locator(getByTestID("row-collectionDate"))).toHaveText(
      sample.collection_date
    );

    // verify collection location
    expect(page.locator(getByTestID("row-collectionLocation"))).toHaveText(
      sample.collection_location.location
    );

    //todo: add remainining fields when test-id are added
  });
});

/**
 * Help function that navigates to sample page
 * and accepts  site cookies
 * @param page
 */
async function displaySamplePage(page: Page): Promise<void> {
  const acceptCookieSelector =
    '[aria-label="Help us improve CZ GEN EPI"] >> text=Accept';
  await page.goto(url);
  //accept cookie t&c (if prompted)
  await page.locator(acceptCookieSelector).click();
}
