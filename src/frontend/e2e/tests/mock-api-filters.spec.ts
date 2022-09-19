import { expect, test } from "@playwright/test";
import { SampleUtil } from "../utils/sample";
import { FilterSample } from "../pages/filter";


test.describe("Mock sample API data tests", () => {
    const url = `${process.env.BASEURL}/data/samples/`;
    const api = `${process.env.BASEAPI}/v2/orgs/${process.env.GROUPID}/pathogens/SC2/samples/`;

  test.only("Should filter by complete genome recovery", async ({ page, context }) => {
    const mockData = {
      sample: SampleUtil.getSampleResponseData(),
    };
    mockData.sample.status = 'completed';
   
    await context.route(api, async (route) => {
      const response = await context.request.get(api);
      expect(response.ok()).toContainEqual("Complete");
      route.fulfill({
        response,
        body: JSON.stringify(mockData),
      });
    });
    await page.goto(url, { waitUntil: "networkidle" }); //wait until all responses have been received
  });

  test("Should filter by failed genome recovery", async ({ page, context }) => {
    const mockData = {
      sample: SampleUtil.getSampleResponseData(),
    };
    mockData.sample.status = 'failed';

    await context.route(api, async (route) => {
      const response = await context.request.fetch(route.request());
      expect(response.ok()).toContainEqual("failed")
      route.fulfill({
        response,
        body: JSON.stringify(mockData),
      });
    });
    await page.goto(url, { waitUntil: "networkidle" }); //wait until all responses have been received
  });

  test("Should filter by Lineages samples", async ({ page, context }) => {
    const mockData = {
      sample: SampleUtil.getSampleResponseData(),
    };
    
    mockData.sample.lineage.lineage = "BA.1.1"

    
    await context.route(api, async (route) => {
      const response = await context.request.fetch(route.request());
      expect(response.ok()).toContainEqual("BA.1.1")
      route.fulfill({
        response,
        body: JSON.stringify(mockData),
      });
    });
    await page.goto(url, { waitUntil: "networkidle" }); //wait until all responses have been received

    mockData.sample.lineage.lineage = "BA.1.15"

    await context.route(api, async (route) => {
        const response = await context.request.fetch(route.request());
        expect(response.ok()).toContainEqual("BA.1.15")
        route.fulfill({
          response,
          body: JSON.stringify(mockData),
        });
      });
      await page.goto(url, { waitUntil: "networkidle" });
  });

  test("Should filter by  samples", async ({ page, context }) => {
    const mockData = {
      sample: SampleUtil.getSampleResponseData(),
    };

   const daysForFilter = FilterSample.getDaysFromDateRange(mockData.sample.collection_date);
   const today = new Date();
   if(daysForFilter <= 7){
        today.setDate(today.getDate() - 7)
   }else if(daysForFilter <= 30){
         today.setDate(today.getDate() - 30)
   }else if(daysForFilter <= 90){
         today.setDate(today.getDate() - 90)
   }else if(daysForFilter <= 180){
         today.setDate(today.getDate() - 180)
   }else {today.setDate(today.getDate() - daysForFilter)}

   mockData.sample.collection_date = today.getFullYear()+"/"+today.getMonth()+"/"+today.getDay();
   
    await context.route(api, async (route) => {
      const response = await context.request.fetch(route.request());
      expect(response.ok());
      route.fulfill({
        response,
        body: JSON.stringify(mockData),
      });
    });
    await page.goto(url, { waitUntil: "networkidle" }); //wait until all responses have been received
  });
});
