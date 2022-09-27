import { expect, test } from "@playwright/test";
import { getByTestID, getByText } from "../utils/selectors";
import path from "path";
import dotenv from "dotenv";
import fs from "fs";

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
const tAndCSelector =
  '[aria-label="Help us improve CZ GEN EPI"] >> text=Accept';
const mockData = JSON.parse(
  fs.readFileSync("e2e/fixtures/sampleList.json") as unknown as string
);
test.describe("Samples page tests", () => {
  test.beforeEach(async ({ page }, workerInfo) => {
    const { baseURL } = workerInfo.config.projects[0].use;
    const url = `${baseURL}` as string;
    await page.goto(`${url}/data/samples`);
    //accept cookie t&c (if prompted and not in CI)
    const tAndC = page.locator(tAndCSelector);
    if (await tAndC.isVisible()) {
      await page.locator(tAndCSelector).click();
    }
  });

  test("Should verify sample list headers", async ({ page }) => {
    tableHeaders.forEach((header) => {
      expect(page.locator(getByText(header)).first()).not.toBeEmpty();
    });
  });

  test("Should verify sample data", async ({ page, context }, workerInfo) => {
    const baseUrl = workerInfo.config.projects[0].use.baseURL;
    const url = `${baseUrl}/data/samples`;
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

    //accept cookie t&c
    const tAndC = page.locator(tAndCSelector);
    if (await tAndC.isVisible()) {
      await page.locator(tAndCSelector).click();
    }

    //wait until data is displayed
    //await page.waitForSelector(getByTestID("table-row"));

    const sampleRows = page.locator(getByTestID("table-row"));
    expect(await sampleRows.count()).toBe(1);

    // verify status
    const status = sample.czb_failed_genome_recovery ? "failed" : "complete";
    expect(page.locator(getByTestID("sample-status"))).toHaveText(status);

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
