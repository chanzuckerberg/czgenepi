import { expect, test } from "@playwright/test";
import { SampleUtil } from "../utils/sample";

test.describe("API tests", () => {
  test.only("Should get samples", async ({ page, context }) => {
    // await page.goto("https://staging.czgenepi.org/data/samples");
    // const data = await SampleUtil.getSamples(context);
    //console.log(data);
    //expect(samples.length).toBeGreaterThan(0);
    const url = `https://api.staging.czgenepi.org//v2/users/me`;
    //console.log("**************")
    await context.route(url, async (route) => {
      //console.log("**************")
      await context.request.fetch(route.request(), {
        method: "GET",
      });
      // .then(response => {
      //   expect(response.ok()).toBeTruthy();
      //   //console.log(response);
      // })
      // .catch(error => {
      //   //console.log(error);
      // })
      route.continue();
    });
  });
});
