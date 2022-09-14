import { Page } from "@playwright/test";
import { faker } from "@faker-js/faker";
import { SampleData } from "../utils/schemas/sampleData";
import { UploadData } from "../utils/schemas/uploadData";
import * as path from 'path';


export class UploadSample {
  public static async uploadSequencingFiles(
    page: Page,
    uploadData: UploadData,
  ): Promise<any> {
    //click upload button
    await page.locator("a[href$='/upload/step1']").click();
    await UploadSample.getSampleDataFile(page,uploadData.dataFile);
    // complete form
    for(let i = 0; i < uploadData.samples.length; i++){
      // fill public ID input
      // TODO modify selector
      await page.locator(`//div[contains(@class,'MuiTableBody-root')]/div[@role='row'][${i+1}]/descendant::input[@name='publicId']`).type(uploadData.samples[i].publicId);
       // fill collection date input
       // TODO modify selector
      await page.locator(`//div[contains(@class,'MuiTableBody-root')]/div[@role='row'][${i+1}]/descendant::input[@name='collectionDate']`).type(uploadData.samples[i].collectionDate);
       // fill search for location input from emergent widget
       // TODO modify selector
      await page.locator(`//div[contains(@class,'MuiTableBody-root')]/div[@role='row'][${i+1}]/descendant::button[@label='Search For Location']`).click();
      await page.locator("//div[@role='tooltip']/descendant::input").type(uploadData.samples[i].collectionLocation,{delay:150});
      await page.keyboard.press("ArrowDown");
      await page.keyboard.press("Enter");
      // fill sequencing date input
      // TODO modify selector
      await page.locator(`//div[contains(@class,'MuiTableBody-root')]/div[@role='row'][${i+1}]/descendant::input[@name='sequencingDate']`).type(uploadData.samples[i].sequencingDate);
       // toggle keep private switch 
       // TODO modify selector
      await page.locator(`//div[contains(@class,'MuiTableBody-root')]/div[@role='row'][${i+1}]/descendant::input[@name='keepPrivate']`).click();
    }
    
  }

  public static async getSampleDataFile(
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

  //to be replaced by mock data in a separate PR
  public static getSampleData(): Array<SampleData> {
    return [
      {
        collectionDate: faker.datatype.string(8),
        collectionLocation: "Africa/Angola/Luanda/Calemba",
        isPrivate: true,
        privateId: faker.datatype.string(8),
        publicId: faker.datatype.string(8),
        sequencingDate: faker.date.recent(10).toISOString().substring(0, 10),
      },
      {
        collectionDate: faker.datatype.string(8),
        collectionLocation: "Europe/Russia/Kaluga/Tarusa",
        isPrivate: true,
        privateId: faker.datatype.string(8),
        publicId: faker.datatype.string(8),
        sequencingDate: faker.date.recent(10).toISOString().substring(0, 10),
      },
      {
        collectionDate: faker.datatype.string(8),
        collectionLocation: "Asia/China",
        isPrivate: true,
        privateId: faker.datatype.string(8),
        publicId: faker.datatype.string(8),
        sequencingDate: faker.date.recent(10).toISOString().substring(0, 10),
      }
    ];
  }
}
