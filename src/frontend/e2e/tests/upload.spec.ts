import { test, expect } from "@playwright/test";
import { UploadSample } from "../pages/upload";

test.describe("Upload sample tests", () => {
  const dateErrorMessage = "Update format to YYYY-MM-DD";
  const fileExtensions = ["txt", "fasta", "fa"]; //todo zip and gzip
  test.beforeEach(async ({ page }, workerInfo) => {
    const baseUrl = workerInfo.config.projects[0].use.baseURL;
    const url = `${baseUrl}/data/samples`;
    await page.goto(url);
  });

  fileExtensions.forEach((extenstion) => {
    test.only(`Should upload ${extenstion.toUpperCase()} sample file`, async ({
      page,
    }) => {
      const uploadData = {
        applyToAll: true,
        dataFiles: ["sampleData.txt"],
        sample: UploadSample.getSampleData(),
      };
      await UploadSample.uploadFiles(page, uploadData);

      //TODO verify data is uploaded
    });
  });

  test(`Should validate collection dates`, async ({ page }) => {
    let samples = UploadSample.getSampleData();
    //overwrite collection dates with invalid values
    for (let i = 0; i < samples.length; i++) {
      samples[i].collectionDate = " ";
    }
    const uploadData = {
      applyToAll: true,
      dataFiles: ["sampleData.txt"],
      sample: samples,
    };
    await UploadSample.uploadFiles(page, uploadData, true, false);
    const errors = page.locator(
      "input[@name='collectionDate']/../following-sibling::p"
    );
    for (let i = 0; i < samples.length; i++) {
      expect(errors.nth(i).textContent()).toBe(dateErrorMessage);
    }
  });

  test(`Should validate sequencing dates`, async ({ page }) => {
    let samples = UploadSample.getSampleData();
    //overwrite equencing dates with invalid values
    for (let i = 0; i < samples.length; i++) {
      samples[i].sequencingDate = " ";
    }
    const uploadData = {
      applyToAll: true,
      dataFiles: ["sampleData.txt"],
      sample: samples,
    };
    await UploadSample.uploadFiles(page, uploadData, false, true);
    const errors = page.locator(
      "input[@name='sequencingDate']/../following-sibling::p"
    );
    for (let i = 0; i < samples.length; i++) {
      expect(errors.nth(i).textContent()).toBe(dateErrorMessage);
    }
  });
});
