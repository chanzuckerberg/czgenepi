import { test, expect } from "@playwright/test";
import { UploadSample } from "../pages/upload";

test.describe("Upload sample tests", () => {
  const dateErrorMessage = "Update format to YYYY-MM-DD";
  const fileExtensions = [".txt", ".fasta", ".fa"]; //todo zip and gzip
  test.beforeEach(async ({ page }, workerInfo) => {
    const baseUrl = workerInfo.config.projects[0].use.baseURL;
    const url = `${baseUrl}/data/samples`;
    await page.goto(url);
  });

  fileExtensions.forEach((extenstion) => {
    test.skip(`Should upload ${extenstion.toUpperCase()} sample file`, async ({
      page,
    }) => {
      const uploadData = {
        dataFile: extenstion,
        samples: UploadSample.getSampleData(),
      };
      await UploadSample.uploadSequencingFiles(page, uploadData);
      await expect(
        page.locator(
          "//button[not(contains(@class,'Mui-disabled')) and text()='Continue']"
        )
      ).toBeVisible();
    });
  });

  test.skip(`Should validate collection dates`, async ({ page }) => {
    const samples = UploadSample.getSampleData();
    //overwrite collection dates with invalid values
    for (let i = 0; i < samples.length; i++) {
      samples[i].collectionDate = " ";
    }
    const uploadData = {
      dataFile: ".txt",
      samples: samples,
    };
    await UploadSample.uploadSequencingFiles(page, uploadData);
    const errors = page.locator("//input[@name='collectionDate']/../../p");
    for (let i = 0; i < samples.length; i++) {
      await expect(await errors.nth(i).textContent()).toBe(dateErrorMessage);
    }
  });

  test.skip(`Should validate sequencing dates`, async ({ page }) => {
    const samples = UploadSample.getSampleData();
    //overwrite equencing dates with invalid values
    for (let i = 0; i < samples.length; i++) {
      samples[i].sequencingDate = " ";
    }
    const uploadData = {
      dataFile: ".txt",
      samples: samples,
    };
    await UploadSample.uploadSequencingFiles(page, uploadData);
    const errors = page.locator(
      "//input[@name='sequencingDate']/../following-sibling::p"
    );
    for (let i = 0; i < samples.length; i++) {
      await expect(await errors.nth(i).textContent()).toBe(dateErrorMessage);
    }
  });
});
