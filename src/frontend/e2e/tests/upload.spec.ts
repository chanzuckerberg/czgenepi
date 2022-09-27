import { test, expect } from "@playwright/test";
import { UploadSample } from "../pages/upload";

test.describe("Upload sample tests", () => {
  const dateErrorMessage = "Update format to YYYY-MM-DD";
  const fileExtensions = [".txt"];
  test.beforeEach(async ({ page }, workerInfo) => {
    const baseUrl = workerInfo.config.projects[0].use.baseURL;
    const url = `${baseUrl}/data/samples`;
    await page.goto(url);
    //accept cookie t&c (if prompted and not in CI)
    const tAndCSelector =
      '[aria-label="Help us improve CZ GEN EPI"] >> text=Accept';
    const tAndC = page.locator(tAndCSelector);
    if (await tAndC.isVisible) {
      await page.locator(tAndCSelector).click();
    }
    //click upload button
    await page.locator('[data-test-id="upload-btn"]').click();
  });

  fileExtensions.forEach((extenstion) => {
    test.only(`Should upload ${extenstion.toUpperCase()} sample file`, async ({
      page,
    }) => {
      const uploadData = {
        dataFile: extenstion,
        samples: UploadSample.createSampleData(),
      };
      await UploadSample.uploadSampleFiles(page, uploadData);

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
    const samples = UploadSample.createSampleData();
    //overwrite collection dates with invalid values
    for (let i = 0; i < samples.length; i++) {
      samples[i].collectionDate = " ";
    }
    const uploadData = {
      dataFile: ".txt",
      samples: samples,
    };
    await UploadSample.uploadSampleFiles(page, uploadData);
    const errors = page.locator('input[name="collectionDate"]');
    //   "//input[@name='collectionDate']/../../p"
    // );
    for (let i = 0; i < samples.length; i++) {
      await expect(await errors.nth(i).textContent()).toBe(dateErrorMessage);
    }
  });

  test(`Should validate sequencing dates`, async ({ page }) => {
    const samples = UploadSample.createSampleData();
    //overwrite equencing dates with invalid values
    for (let i = 0; i < samples.length; i++) {
      samples[i].sequencingDate = " ";
    }
    const uploadData = {
      dataFile: ".txt",
      samples: samples,
    };
    await UploadSample.uploadSampleFiles(page, uploadData);
    const errors = page.locator('input[name="sequencingDate]');
    //   "//input[@name='sequencingDate']/../following-sibling::p"
    // );
    for (let i = 0; i < samples.length; i++) {
      expect(await errors.nth(i).textContent()).toBe(dateErrorMessage);
    }
  });
});
