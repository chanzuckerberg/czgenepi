import { expect, test } from "@playwright/test";
import { SampleUtil } from "../utils/sample";
import { NextstrainUtil } from "../utils/nexstraintree";

test.describe("Mock sample API data tests", () => {
  test("Should mock get samples api", async ({ page, context }) => {
    const samples = [];
    for (let i = 1; i <= 3; i++) {
      samples.push(SampleUtil.getSampleResponseData());
    }
    const mockData = {
      samples: samples,
    };

    const url = `${process.env.BASEURL}/data/samples/`;
    const api = `${process.env.BASEAPI}/v2/orgs/${process.env.GROUPID}/pathogens/SC2/samples/`;
    await context.route(api, async (route) => {
      const response = await context.request.fetch(route.request());
      expect(response.ok()).toBeTruthy();
      route.fulfill({
        response,
        body: JSON.stringify(mockData),
      });
    });
    await page.goto(url, { waitUntil: "networkidle" });
    await page.locator('text="Accept"').first().click();
  });

  //this test is for demo only and will be deleted before merging PR
  // test("Should generate sample upload data", async () => {
  //   const data = SampleUtil.getSampleUploadData();
  //   console.log(data);
  // });

  //this test is for demo only and will be deleted before merging PR
  // test("Should generate nextstrain data", async () => {
  //   const data = NextstrainUtil.getNextStrainTreeData();
  //   console.log(data);
  // });
});
