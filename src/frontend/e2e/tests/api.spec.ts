import { expect, test } from "@playwright/test";
import { SampleUtil } from "../utils/sample";

test.describe("API tests", () => {
  test.only("Should get samples", async ({ page, context }) => {
    const mockData = { ublicId: "test" };
    await SampleUtil.mockGetSamplesApi(page, context, mockData);
  });
});
