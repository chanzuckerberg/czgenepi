import { expect, test } from "@playwright/test";
import SampleUtil from "../utils/sample";

test.describe("API tests", () => {
  test.only("Should get samples", async () => {
    await SampleUtil.getSamples().then((data) => {
      const samples = data.samples as Array<any>;
      console.log(samples);
      //expect(samples.length).toBeGreaterThan(0);
    });
  });
});
