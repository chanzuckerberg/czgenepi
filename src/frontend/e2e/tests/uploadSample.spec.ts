import { test, expect } from "@playwright/test";
import { SampleData } from "../utils/schemas/sampleData";
import { LoginPage } from "../pages/LoginPage";
import { SamplesPage } from "../pages/SamplesPage";
import { UploadPage } from "../pages/UploadPage";

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
    await uploadPage.uploadSampleFiles("test_data.txt");
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
    // await uploadPage.page.waitForTimeout(2000);
    // await uploadPage.uploadSampleFiles('test_data.gz');
    // await uploadPage.page.waitForTimeout(3000)
    // await uploadPage.cancelButton.click();
    // await uploadPage.page.waitForTimeout(2000);
    // await uploadPage.uploadSampleFiles('test_data.zip');
    // await uploadPage.page.waitForTimeout(3000);
  });

  test("sample form test1", async ({ page }) => {
    const sampleData1: SampleData = {
      privateId: "my name",
      publicId: "juan camaney",
      collectionDate: "   ",
      collectionLocation: "Africa/Angola/Luanda/Calemba",
      sequencingDate: "    ",
      isPrivate: true,
    };
    const sampleData2: SampleData = {
      privateId: "her name",
      publicId: "this is public",
      collectionDate: "2022-08-lou",
      collectionLocation: "israel",
      sequencingDate: "2022-04-768",
      isPrivate: true,
    };
    const sampleData3: SampleData = {
      privateId: "no more names here",
      publicId: "could be public ",
      collectionDate: "2022-02-04",
      collectionLocation: "South America/Brazil/Santa Catarina/Itapoa",
      sequencingDate: "2022-07-04",
      isPrivate: true,
    };
    await samplePage.navigateToUpload();
    await uploadPage.uploadSampleFiles("test_data.txt");
    await uploadPage.clickContinue();
    await uploadPage.fillSampleInfo("hCoV-19/USA/CA-CCC_Ex8", sampleData1);
    await expect(
      await uploadPage.getCollectionDateInvalidFormatMessage(
        "hCoV-19/USA/CA-CCC_Ex8"
      )
    ).toBe("Update format to YYYY-MM-DD");
    await expect(
      await uploadPage.getsequencingDateInvalidFormatMessage(
        "hCoV-19/USA/CA-CCC_Ex8"
      )
    ).toBe("Update format to YYYY-MM-DD");
    await uploadPage.fillSampleInfo("hCoV-19/USA/CA-CCC_Ex9", sampleData2);
    await expect(
      await uploadPage.getCollectionDateInvalidFormatMessage(
        "hCoV-19/USA/CA-CCC_Ex9"
      )
    ).toBe("Update format to YYYY-MM-DD");
    await expect(
      await uploadPage.getsequencingDateInvalidFormatMessage(
        "hCoV-19/USA/CA-CCC_Ex9"
      )
    ).toBe("Update format to YYYY-MM-DD");
    await uploadPage.fillSampleInfo("hCoV-19/USA/CA-CCC_Ex10", sampleData3);
    await expect(
      await page
        .locator(
          await uploadPage.collectionDateInvalidFormatMsg.replace(
            "${VAR}",
            "hCoV-19/USA/CA-CCC_Ex10"
          )
        )
        .isVisible()
    ).toBe(false);
    await expect(
      await page
        .locator(
          await uploadPage.sequencingDateInvalidFormatMsg.replace(
            "${VAR}",
            "hCoV-19/USA/CA-CCC_Ex10"
          )
        )
        .isVisible()
    ).toBe(false);
    await page.waitForTimeout(2000);
  });

  test("sample form test2", async () => {
    const sampleData1: SampleData = {
      privateId: "random name",
      publicId: "juan camaney",
      collectionDate: "2022-04-12",
      collectionLocation: "Africa/Angola/Luanda/Calemba",
      sequencingDate: "2022-04-12",
      isPrivate: true,
    };
    const sampleData2: SampleData = {
      privateId: "another big name",
      publicId: "pedro paramo",
      collectionDate: "2022-08-08",
      collectionLocation: "North America/Mexico",
      sequencingDate: "2022-04-23",
      isPrivate: true,
    };
    const sampleData3: SampleData = {
      privateId: "the largest name ever",
      publicId: "john mclane",
      collectionDate: "2022-02-04",
      collectionLocation: "South America/Brazil/Santa Catarina/Itapoa",
      sequencingDate: "2022-07-04",
      isPrivate: true,
    };
    await samplePage.navigateToUpload();
    await uploadPage.uploadSampleFiles("test_data.txt");
    await uploadPage.clickContinue();
    await uploadPage.fillSampleInfo("hCoV-19/USA/CA-CCC_Ex9", sampleData1);
    await uploadPage.fillSampleInfo("hCoV-19/USA/CA-CCC_Ex8", sampleData2);
    await uploadPage.fillSampleInfo("hCoV-19/USA/CA-CCC_Ex10", sampleData3);
    await expect(await uploadPage.submitSamplesButton.isVisible()).toBe(true);
  });
});
