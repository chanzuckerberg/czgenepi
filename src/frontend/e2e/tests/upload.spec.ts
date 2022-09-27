import { test, expect } from "@playwright/test";
import { uploadSampleFiles } from "../pages/upload";
import { createSampleUploadData } from "../utils/sample";

test.describe("Upload sample tests", () => {
  const dateErrorMessage = "Update format to YYYY-MM-DD";
  const fileExtensions = [".txt", ".fa", ".fasta"];
  test.beforeEach(async ({ page }, workerInfo) => {
    const baseUrl = workerInfo.config.projects[0].use.baseURL;
    const url = `${baseUrl}/data/samples`;
    await page.goto(url);
    //accept cookie t&c (if prompted and not in CI)
    const tAndCSelector =
      '[aria-label="Help us improve CZ GEN EPI"] >> text=Accept';
    const tAndC = page.locator(tAndCSelector);
    if (await tAndC.isVisible()) {
      await page.locator(tAndCSelector).click();
    }
    //click upload button
    await page.locator('[data-test-id="upload-btn"]').click();
  });

  fileExtensions.forEach((extenstion) => {
    test(`Should upload ${extenstion.toUpperCase()} sample file`, async ({
      page,
    }) => {
      const samples = [];
      for (let i = 0; i < 3; i++) {
        samples.push(createSampleUploadData());
      }
      const uploadData = {
        dataFile: extenstion,
        samples: samples,
      };
      await uploadSampleFiles(page, uploadData);

      //continue button
      await page.locator('a:has-text("Continue")').click();

      //accept terms and conditions
      await page.locator('input[type="checkbox"]').nth(0).click();
      await page.locator('input[type="checkbox"]').nth(1).click();

      await page.locator("text=Start Upload").click();

      // show confirmation and finish process
      await expect(page.locator("text=Upload Complete!")).toBeVisible();
      await page.locator("text=Go to Samples").click();
    });
  });

  test(`Should validate collection dates`, async ({ page }) => {
    const samples = [];
    //overwrite collection dates with invalid values
    for (let i = 0; i < 3; i++) {
      const sample = createSampleUploadData();
      sample.collection_date = " ";
      samples.push(sample);
    }
    const uploadData = {
      dataFile: ".txt",
      samples: samples,
    };
    await uploadSampleFiles(page, uploadData);
    expect(await page.locator(`text=${dateErrorMessage}`).count()).toBe(3);
  });

  test(`Should validate sequencing dates`, async ({ page }) => {
    const samples = [];
    //overwrite collection dates with invalid values
    for (let i = 0; i < 3; i++) {
      const sample = createSampleUploadData();
      sample.sequencing_date = " ";
      samples.push(sample);
    }

    const uploadData = {
      dataFile: ".txt",
      samples: samples,
    };
    await uploadSampleFiles(page, uploadData);
    expect(await page.locator(`text=${dateErrorMessage}`).count()).toBe(3);
  });
});
