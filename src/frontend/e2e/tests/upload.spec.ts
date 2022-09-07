import { test, expect, Page, chromium } from "@playwright/test";
import { UploadSample } from "../pages/upload";

let page: Page;
test.describe("Upload sample tests", () => {
  const dateErrorMessage = "Update format to YYYY-MM-DD";
  const fileExtensions = ["txt", "fasta", "fa"]; //todo zip and gzip
  test.beforeEach(async ({}, workerInfo) => {
    const baseUrl = workerInfo.config.projects[0].use.baseURL;
    const url = `${baseUrl}/data/samples`;
    const browser = await chromium.launch();
    page = await browser.newPage();
    await page.goto(url);
  });

  fileExtensions.forEach((extenstion) => {
    test(`Should upload ${extenstion.toUpperCase()} sample file`, async () => {
      const uploadData = {
        applyToAll: true,
        dataFiles: ["sampleData.txt"],
        sample: UploadSample.getSampleData(),
      };
      await UploadSample.uploadFiles(page, uploadData);

      //TODO verify data is uploaded
    });
  });

  test(`Should validate collection dates`, async () => {
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

  test(`Should validate sequencing dates`, async () => {
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
