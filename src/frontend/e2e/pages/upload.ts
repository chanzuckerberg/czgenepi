import { Page } from "@playwright/test";
import { faker } from "@faker-js/faker";
import { SampleData } from "../utils/schemas/sampleData";
import { UploadData } from "../utils/schemas/uploadData";
import * as path from 'path';


export class UploadSample {
  public static async uploadFiles(
    page: Page,
    uploadData: UploadData,
  ): Promise<any> {
    //click upload button
    await page.locator("a[href$='/upload/step1']").click();
    await UploadSample.selectSample(page,uploadData.dataFile);
    // complete form
    for(let i = 0; i < uploadData.samples.length; i++){
      await page.locator(`//div[contains(@class,'MuiTableBody-root')]/div[@role='row'][${i+1}]/descendant::input[@name='publicId']`).type(uploadData.samples[i].publicId);
      await page.locator(`//div[contains(@class,'MuiTableBody-root')]/div[@role='row'][${i+1}]/descendant::input[@name='collectionDate']`).type(uploadData.samples[i].collectionDate);
      await page.locator(`//div[contains(@class,'MuiTableBody-root')]/div[@role='row'][${i+1}]/descendant::button[@label='Search For Location']`).click();
      await page.locator("//div[@role='tooltip']/descendant::input").type(uploadData.samples[i].collectionLocation,{delay:150});
      await page.keyboard.press("ArrowDown");
      await page.keyboard.press("Enter");
      await page.locator(`//div[contains(@class,'MuiTableBody-root')]/div[@role='row'][${i+1}]/descendant::input[@name='sequencingDate']`).type(uploadData.samples[i].sequencingDate);
      await page.locator(`//div[contains(@class,'MuiTableBody-root')]/div[@role='row'][${i+1}]/descendant::input[@name='keepPrivate']`).click();
    }
    
  }

  public static async selectSample(
    page: Page,
    fileName: string
  ): Promise<void> {
   
   await page.setInputFiles(
      "input[type='file']",
      path.resolve('e2e/fixtures/sampleData'+fileName)
    );
    await page.waitForTimeout(3000);
    // click continue button
    await page.locator("a[href$='/upload/step2']").click();
    await page.waitForSelector("form div[role='table'] > .MuiTableBody-root");
  }

  // prefix each file name with path. set default if not file provided
  public static getFullSampleFilePaths(
    fileNames?: Array<string>
  ): Array<string> {
    const files = fileNames !== undefined ? fileNames : ["sampleData.fasta"];
    const fullPathFiles: Array<string> = [];
    files.forEach((file) => {
      fullPathFiles.push(`../fixtures/${file}`);
    });
    return fullPathFiles;
  }

  //to be replaced by mock data in a separate PR
  public static getSampleData(): Array<SampleData> {
    return [
      {
        collectionDate: "2022-07-01",
        collectionLocation: "Africa/Angola/Luanda/Calemba",
        isPrivate: true,
        privateId: faker.datatype.string(8),
        publicId: faker.datatype.string(8),
        sequencingDate: faker.date.recent(10).toISOString().substring(0, 10),
      },
      {
        collectionDate: "2022-08-01",
        collectionLocation: "Europe/Russia/Kaluga/Tarusa",
        isPrivate: true,
        privateId: faker.datatype.string(8),
        publicId: faker.datatype.string(8),
        sequencingDate: faker.date.recent(10).toISOString().substring(0, 10),
      },
      {
        collectionDate: "2022-04-01",
        collectionLocation: "Asia/China",
        isPrivate: true,
        privateId: faker.datatype.string(8),
        publicId: faker.datatype.string(8),
        sequencingDate: faker.date.recent(10).toISOString().substring(0, 10),
      }
    ];
  }
}
