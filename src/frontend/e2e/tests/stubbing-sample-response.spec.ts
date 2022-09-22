import { expect, test } from "@playwright/test";
import { SampleUtil } from "../utils/sample";
import { FilterSample } from "../pages/filter";
import path from "path";
import * as dotenv from "dotenv";

// this should not be hard coded but driven by NODE_ENV
dotenv.config({
  path: path.resolve(__dirname, "../../", ".env.staging"),
});

test.describe("Sample page tests with mocked data", () => {
  const url = `${process.env.BASEURL}/data/samples/`;
  const api = `${process.env.BASEAPI}/v2/orgs/${process.env.GROUPID}/pathogens/SC2/samples/`;

  /**
   * For E2E tests, we should test against data from backend, but this test demonstrates how we can test
   * frontend in isolation by mocking the sample response from the backend. Here we are actually letting
   * the call hit backend but we can have total isolation by aborting the call so we are completely
   * independent of the backend of our tests.
   * For more details, check https://playwright.dev/docs/network
   */
  test.only("Should render mocked sample response", async ({
    page,
    context,
  }) => {
    // create mock data with 5 samples
    const responseSamples = [];
    for (let i = 1; i <= 5; i++) {
      responseSamples.push(SampleUtil.getSampleResponseData());
    }
    const mockData = {
      samples: responseSamples,
    };

    //create an intercept to stub response with mock data once we get response with status 200
    await context.route(api, async (route) => {
      const response = await context.request.get(api);
      //check we get response 200, but we could also abort the call (route.abort() : route.continue();)
      expect(response.ok()).toBeTruthy();
      //retain original response but replace body part with stubbed data we created
      route.fulfill({
        response,
        body: JSON.stringify(mockData),
      });
    });
    // make the actual, wait until all responses have been received
    await page.goto(url, { waitUntil: "networkidle" });
    //accept cookie t&c
    await page.locator('text="Accept"').first().click();

    //wait until data is displayed
    await page.waitForSelector('[data-test-id="table-row"]');

    // assert table is populated with at least one record
    expect(
      await page.locator('[data-test-id="table-row"]').count()
    ).toBeGreaterThan(0);

    // for debugging only
    await page.screenshot({ path: "screenshot.png", fullPage: true });

    // Verify data on UI against our mock
    for (let i = 0; i < responseSamples.length; i++) {
      const item = responseSamples[i];
      //console.log("***************");
      //console.log(item.czb_failed_genome_recovery);
      const mockStatusText = item.czb_failed_genome_recovery
        ? "failed"
        : "complete";
      const statusTextOnUi = await page
        .locator('[data-test-id="sample-status"]')
        .nth(i)
        .textContent();
     //console.log(statusTextOnUi);
      // verify status on UI
      expect(statusTextOnUi).toBe(mockStatusText); //this fails but because I am not sure how is the status determined; it is not coming from reponse

      // verify remaining fields
    }
  });

  test.skip("Should filter by failed genome recovery", async ({
    page,
    context,
  }) => {
    const mockData = {
      sample: SampleUtil.getSampleResponseData(),
    };
   // mockData.sample.status = "failed";

    await context.route(api, async (route) => {
      const response = await context.request.fetch(route.request());
      expect(response.ok()).toContainEqual("failed");
      route.fulfill({
        response,
        body: JSON.stringify(mockData),
      });
    });
    await page.goto(url, { waitUntil: "networkidle" }); //wait until all responses have been received
  });

  test.skip("Should filter by Lineages samples", async ({ page, context }) => {
    const mockData = {
      sample: SampleUtil.getSampleResponseData(),
    };

    mockData.sample.lineage.lineage = "BA.1.1";

    await context.route(api, async (route) => {
      const response = await context.request.fetch(route.request());
      expect(response.ok()).toContainEqual("BA.1.1");
      route.fulfill({
        response,
        body: JSON.stringify(mockData),
      });
    });
    await page.goto(url, { waitUntil: "networkidle" }); //wait until all responses have been received

    mockData.sample.lineage.lineage = "BA.1.15";

    await context.route(api, async (route) => {
      const response = await context.request.fetch(route.request());
      expect(response.ok()).toContainEqual("BA.1.15");
      route.fulfill({
        response,
        body: JSON.stringify(mockData),
      });
    });
    await page.goto(url, { waitUntil: "networkidle" });
  });

  // test.skip("Should filter by  samples", async ({ page, context }) => {
  //   const mockData = {
  //     sample: SampleUtil.getSampleResponseData(),
  //   };

  //   const today = FilterSample.getPastDateBasedOnSampleResponse(
  //     mockData.sample.collection_date
  //   );

  //   mockData.sample.collection_date =
  //     today.getFullYear() + "/" + today.getMonth() + "/" + today.getDay();

  //   await context.route(api, async (route) => {
  //     const response = await context.request.fetch(route.request());
  //     expect(response.ok());
  //     route.fulfill({
  //       response,
  //       body: JSON.stringify(mockData),
  //     });
  //   });
  //   await page.goto(url, { waitUntil: "networkidle" }); //wait until all responses have been received
  // });
});
