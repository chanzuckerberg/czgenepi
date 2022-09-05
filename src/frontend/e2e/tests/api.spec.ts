import { expect, test } from "@playwright/test";
import { SampleUtil } from "../utils/sample";

test.describe("API tests", () => {
  test.only("Should mock get samples api", async ({ page, context }) => {
    const mockData = {
      samples: [SampleUtil.generateRandomSampleData()],
    };
    console.log(JSON.stringify(mockData));

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
    await page.screenshot({ path: "screenshot.png", fullPage: true });
  });
});
