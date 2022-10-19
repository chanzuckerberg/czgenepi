import { test, expect } from "@playwright/test";
import { uploadSampleFiles } from "../utils/upload";
import { createSampleUploadData } from "../utils/sample";
import { BasePage } from "../pages/basePage";
import { getLocations } from "../utils/common";

const locations = getLocations();
const totalLocations = locations.length;
const defaultFileExtension = "txt";

let basePage: BasePage;
test.describe("Upload sample tests", () => {
  const dateErrorMessage = "Update format to YYYY-MM-DD";
  const fileExtensions = ["fa", "fasta", "txt"]; //todo: add zip and gzip
  test.beforeEach(async ({ page }, workerInfo) => {
    const baseUrl = workerInfo.config.projects[0].use.baseURL;
    const url = `${baseUrl}/data/samples`;
    basePage = new BasePage(page);
    await basePage.gotoUrl(url);
    //accept site cookies
    await basePage.acceptCookies();

    //click upload button
    await basePage.clickByTestId("upload-btn");

    //accept site cookies if prompted again
    await basePage.acceptCookies();
  });

  fileExtensions.forEach((fileExtension) => {
    test(`Should upload ${fileExtension.toUpperCase()} sample file`, async () => {
      const samples = [];
      for (let i = 0; i < totalLocations; i++) {
        const defaults = { location: locations[i] };
        samples.push(createSampleUploadData(defaults));
      }
      await uploadSampleFiles(basePage, fileExtension, samples);

      //accept site cookies if prompted again
      await basePage.acceptCookies();

      //continue button
      await basePage.clickElement('a:has-text("Continue")');

      //accept terms and conditions
      const acceptUploadToGroupCheckBox = 0;
      const acceptCzGenepiTermsCheckBox = 1;
      await basePage.clickCheckBox(acceptUploadToGroupCheckBox);
      await basePage.clickCheckBox(acceptCzGenepiTermsCheckBox);

      await basePage.clickByText("Start Upload");

      // show confirmation and finish process
      await expect(await basePage.findByText("Upload Complete!")).toBeVisible();
      await basePage.clickByText("Go to Samples");
    });
  });

  test(`Should validate collection dates`, async () => {
    const samples = [];
    const ignoreLocation = true;
    //overwrite collection dates with invalid values
    for (let i = 0; i < totalLocations; i++) {
      const defaults = { location: locations[i] };
      const sample = createSampleUploadData(defaults);
      sample.collection_date = "20-20-20";
      samples.push(sample);
    }
    await uploadSampleFiles(
      basePage,
      defaultFileExtension,
      samples,
      ignoreLocation
    );
    //accept site cookies if prompted again
    await basePage.acceptCookies();

    expect((await basePage.findByText(dateErrorMessage)).count()).toBe(
      samples.length
    );
  });

  test(`Should validate sequencing dates`, async () => {
    const samples = [];
    const ignoreLocation = true;
    //overwrite collection dates with invalid values
    for (let i = 0; i < totalLocations; i++) {
      const defaults = { location: locations[i] };
      const sample = createSampleUploadData(defaults);
      sample.sequencing_date = "20-20-20";
      samples.push(sample);
    }

    await uploadSampleFiles(
      basePage,
      defaultFileExtension,
      samples,
      ignoreLocation
    );
    //accept site cookies if prompted again
    await basePage.acceptCookies();

    expect((await basePage.findByText(dateErrorMessage)).count()).toBe(
      samples.length
    );
  });
});
