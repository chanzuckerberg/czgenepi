import { test, expect } from "@playwright/test";
import { SampleData } from "../utils/schemas/sampleData";
import { LoginPage } from "../pages/LoginPage";
import { SamplesPage } from "../pages/SamplesPage";
import { UploadPage } from "../pages/UploadPage";

const textFile = "test_data.txt";
const publicId8 = "hCoV-19/USA/CA-CCC_Ex8";
const publicId9 = "hCoV-19/USA/CA-CCC_Ex9";
const publicId10 = "hCoV-19/USA/CA-CCC_Ex10";
const updateDateMsg = "Update format to YYYY-MM-DD";

test.describe("Filter Test Suite", () => {
  let loginPage: LoginPage;
  let samplePage: SamplesPage;
  let uploadPage: UploadPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    samplePage = new SamplesPage(page);
    uploadPage = new UploadPage(page);
    //await loginPage.login();
  });

  test("upload extension files test", async () => {
    await samplePage.navigateToUpload();
    await uploadPage.uploadSampleFiles(textFile);
    await expect(uploadPage.importedFileNameList).toHaveText(
      await uploadPage.getImportedFileNameList()
    );
    await uploadPage.page.waitForTimeout(3000);
    await uploadPage.removeAllImportedFiles();
    await uploadPage.page.waitForTimeout(2000);
    await uploadPage.uploadSampleFiles("test_data.fasta");
    await expect(uploadPage.importedFileNameList).toHaveText(
      await uploadPage.getImportedFileNameList()
    );
    await uploadPage.page.waitForTimeout(3000);
    await uploadPage.removeAllImportedFiles();
    await uploadPage.page.waitForTimeout(2000);
    await uploadPage.uploadSampleFiles("test_data.fa");
    await expect(uploadPage.importedFileNameList).toHaveText(
      await uploadPage.getImportedFileNameList()
    );
    await uploadPage.page.waitForTimeout(3000);
    await uploadPage.removeAllImportedFiles();
    await uploadPage.page.waitForTimeout(3000);
  });

  test("sample form test1", async ({ page }) => {
    const sampleData1: SampleData = {
      collectionDate: "   ",
      collectionLocation: "Africa/Angola/Luanda/Calemba",
      isPrivate: true,
      privateId: "my name",
      publicId: "juan camaney",
      sequencingDate: "    ",
    };
    const sampleData2: SampleData = {
      collectionDate: "2022-08-lou",
      collectionLocation: "israel",
      isPrivate: true,
      privateId: "her name",
      publicId: "this is public",
      sequencingDate: "2022-04-768",
    };
    const sampleData3: SampleData = {
      collectionDate: "2022-02-04",
      collectionLocation: "South America/Brazil/Santa Catarina/Itapoa",
      isPrivate: true,
      privateId: "no more names here",
      publicId: "could be public ",
      sequencingDate: "2022-07-04",
    };
    await samplePage.navigateToUpload();
    await uploadPage.uploadSampleFiles(textFile);
    await uploadPage.clickContinue();
    await uploadPage.fillSampleInfo(publicId8, sampleData1);
    await expect(
      await uploadPage.getCollectionDateInvalidFormatMessage(publicId8)
    ).toBe(updateDateMsg);
    await expect(
      await uploadPage.getsequencingDateInvalidFormatMessage(publicId8)
    ).toBe(updateDateMsg);
    await uploadPage.fillSampleInfo(publicId9, sampleData2);
    await expect(
      await uploadPage.getCollectionDateInvalidFormatMessage(publicId9)
    ).toBe(updateDateMsg);
    await expect(
      await uploadPage.getsequencingDateInvalidFormatMessage(publicId9)
    ).toBe(updateDateMsg);
    await uploadPage.fillSampleInfo("hCoV-19/USA/CA-CCC_Ex10", sampleData3);
    await expect(
      await page
        .locator(
          await uploadPage.collectionDateInvalidFormatMsg.replace(
            "${VAR}",
            publicId10
          )
        )
        .isVisible()
    ).toBe(false);
    await expect(
      await page
        .locator(
          await uploadPage.sequencingDateInvalidFormatMsg.replace(
            "${VAR}",
            publicId10
          )
        )
        .isVisible()
    ).toBe(false);
    await page.waitForTimeout(2000);
  });

  test("sample form test2", async () => {
    const sampleData1: SampleData = {
      collectionDate: "2022-04-12",
      collectionLocation: "Africa/Angola/Luanda/Calemba",
      isPrivate: true,
      privateId: "random name",
      publicId: "juan camaney",
      sequencingDate: "2022-04-12",
    };
    const sampleData2: SampleData = {
      collectionDate: "2022-08-08",
      collectionLocation: "North America/Mexico",
      isPrivate: true,
      privateId: "another big name",
      publicId: "pedro paramo",
      sequencingDate: "2022-04-23",
    };
    const sampleData3: SampleData = {
      collectionDate: "2022-02-04",
      collectionLocation: "South America/Brazil/Santa Catarina/Itapoa",
      isPrivate: true,
      privateId: "the largest name ever",
      publicId: "john mclane",
      sequencingDate: "2022-07-04",
    };
    await samplePage.navigateToUpload();
    await uploadPage.uploadSampleFiles(textFile);
    await uploadPage.clickContinue();
    await uploadPage.fillSampleInfo(publicId9, sampleData1);
    await uploadPage.fillSampleInfo(publicId8, sampleData2);
    await uploadPage.fillSampleInfo(publicId10, sampleData3);
    await expect(await uploadPage.submitSamplesButton.isVisible()).toBe(true);
  });
});
