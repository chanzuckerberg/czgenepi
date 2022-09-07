import { test, expect, Page, chromium } from "@playwright/test";
import { SamplesPage } from "../pages/SamplesPage";
import { UploadSample } from "../pages/upload";
import path from "path";
import * as dotenv from "dotenv";
import { getByTestID } from "../utils/selectors";
dotenv.config({ path: path.join(__dirname, "../.env") });

let page: Page;
test.describe("Upload sample tests", () => {
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

  test(`Should validate collection and sequencing dates`, async () => {
    let samples = UploadSample.getSampleData();
    //overwrite collection and sequencing dates with invalid values
    for (let i = 0; i < samples.length; i++) {
      samples[i].collectionDate = " ";
      samples[i].sequencingDate = " ";
    }
    const uploadData = {
      applyToAll: true,
      dataFiles: ["sampleData.txt"],
      sample: samples,
    };
    await UploadSample.uploadFiles(page, uploadData, {
      date: "Update format to YYYY-MM-DD",
    });

    //TODO verify data is uploaded
  });

  // test('Should fill form invalid data', async({page})=>{
  //     const invalidSamples=[
  //         {
  //             collectionDate: "   ",
  //             collectionLocation: "Africa/Angola/Luanda/Calemba",
  //             isPrivate: true,
  //             privateId: "my name",
  //             publicId: "juan camaney",
  //             sequencingDate:"    "
  //         },
  //         {
  //             collectionDate: "2022-08-lou",
  //             collectionLocation: "israel",
  //             isPrivate: true,
  //             privateId: "her name",
  //             publicId: "this is public",
  //             sequencingDate:"2022-04-768",
  //         },
  //         {
  //             collectionDate: "2022-02-04",
  //             collectionLocation: "South America/Brazil/Santa Catarina/Itapoa",
  //             isPrivate: true,
  //             privateId: "no more names here",
  //             publicId: "could be public ",
  //             sequencingDate:"2022-07-04",

  //         }
  //     ];

  //     await samplePage.navigateToUpload();
  //     await uploadPage.uploadSampleFiles(testDataTxt);
  //     await uploadPage.clickContinue();
  //     for(let i = 0; i < 2; i++){
  //         await uploadPage.fillSampleInfo(sampleNames[i],invalidSamples[i]);
  //         await expect(await uploadPage.getCollectionDateInvalidFormatMessage(sampleNames[i])).toBe('Update format to YYYY-MM-DD');
  //         await expect(await uploadPage.getsequencingDateInvalidFormatMessage(sampleNames[i])).toBe('Update format to YYYY-MM-DD');
  //     }
  //     await uploadPage.fillSampleInfo(sampleNames[2],invalidSamples[2]);
  //     await expect(await page.locator(await uploadPage.collectionDateInvalidFormatMsg.replace('${VAR}',sampleVirus10)).isVisible()).toBe(false);
  //     await expect(await page.locator(await uploadPage.sequencingDateInvalidFormatMsg.replace('${VAR}',sampleVirus10)).isVisible()).toBe(false);
  // });

  // test('Should fill upload form ', async()=>{
  //     const validSamples = [
  //         {
  //             collectionDate: "2022-04-12",
  //             collectionLocation: "Africa/Angola/Luanda/Calemba",
  //             isPrivate: true,
  //             privateId: "random name",
  //             publicId: "juan camaney",
  //             sequencingDate:"2022-04-12",
  //         },
  //         {
  //             collectionDate: "2022-08-08",
  //             collectionLocation: "North America/Mexico",
  //             isPrivate: true,
  //             privateId: "another big name",
  //             publicId: "pedro paramo",
  //             sequencingDate:"2022-04-23",

  //         },
  //         {
  //             collectionDate: "2022-02-04",
  //             collectionLocation: "South America/Brazil/Santa Catarina/Itapoa",
  //             isPrivate: true,
  //             privateId: "the largest name ever",
  //             publicId: "john mclane",
  //             sequencingDate:"2022-07-04",
  //         }
  //     ]
  //     await samplePage.navigateToUpload();
  //     await uploadPage.uploadSampleFiles(testDataTxt);
  //     await uploadPage.clickContinue();
  //     for (let index = 0; index < sampleNames.length; index++) {
  //         await uploadPage.fillSampleInfo(sampleNames[index],validSamples[index]);
  //     }
  //     await expect(await uploadPage.submitSamplesButton.isVisible()).toBe(true);
  // });
});
