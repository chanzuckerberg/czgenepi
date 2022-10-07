import { test, expect } from "@playwright/test";
import { uploadSampleFiles } from "../utils/upload";
import { createSampleUploadData } from "../utils/sample";
import { acceptSiteCookieTerms } from "../utils/common";

const locations = [
  "Africa/Angola/Luanda",
  "Europe/Russia/Kaluga",
  "Asia/China",
];
test.describe("Upload sample tests", () => {
  const dateErrorMessage = "Update format to YYYY-MM-DD";
  const fileExtensions = ["fa", "fasta", "txt"]; //todo: add zip and gzip
  test.beforeEach(async ({ page }, workerInfo) => {
    const baseUrl = workerInfo.config.projects[0].use.baseURL;
    const url = `${baseUrl}/data/samples`;
    await page.goto(url);
    //accept site cookies
    await acceptSiteCookieTerms(page);

    //click upload button
    await page.locator('[data-test-id="upload-btn"]').click();

    //accept site cookies if prompted again
    await acceptSiteCookieTerms(page);
  });

  fileExtensions.forEach((extenstion) => {
    test(`Should upload ${extenstion.toUpperCase()} sample file`, async ({
      page,
    }) => {
      const samples = [];
      for (let i = 0; i < 3; i++) {
        const defaults = { location: locations[i] };
        samples.push(createSampleUploadData(defaults));
      }
      const uploadData = {
        fileExtension: extenstion,
        samples: samples,
      };
      await uploadSampleFiles(page, uploadData);

      //accept site cookies if prompted again
      await acceptSiteCookieTerms(page);

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
      const defaults = { location: locations[i] };
      const sample = createSampleUploadData(defaults);
      sample.collection_date = " ";
      samples.push(sample);
    }
    const uploadData = {
      fileExtension: "txt",
      samples: samples,
    };
    await uploadSampleFiles(page, uploadData);
    expect(await page.locator(`text=${dateErrorMessage}`).count()).toBe(3);
  });

  test(`Should validate sequencing dates`, async ({ page }) => {
    const samples = [];
    //overwrite collection dates with invalid values
    for (let i = 0; i < 3; i++) {
      const defaults = { location: locations[i] };
      const sample = createSampleUploadData(defaults);
      sample.sequencing_date = " ";
      samples.push(sample);
    }

    const uploadData = {
      fileExtension: "txt",
      samples: samples,
    };
    await uploadSampleFiles(page, uploadData);
    expect(await page.locator(`text=${dateErrorMessage}`).count()).toBe(3);
  });
});
