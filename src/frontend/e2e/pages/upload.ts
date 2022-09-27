import { Page } from "@playwright/test";
import { faker } from "@faker-js/faker";
import { SampleData } from "../utils/schemas/sampleData";
import { UploadData } from "../utils/schemas/uploadData";
import * as path from "path";

export class UploadSample {
  public static async uploadSampleFiles(
    page: Page,
    uploadData: UploadData
  ): Promise<any> {
    await UploadSample.selectSampleFiles(page, uploadData.dataFile);
    // complete form
    for (let i = 0; i < uploadData.samples.length; i++) {
      // fill public ID input
      await page
        .locator('input[name="publicId"]')
        .nth(i)
        .type(uploadData.samples[i].publicId);
      // fill collection date input
      await page
        .locator('input[name="collectionDate"]')
        .nth(i)
        .type(uploadData.samples[i].collectionDate);
      // fill search for location input
      await page.locator('button[label="Search For Location"]').nth(i).click();
      // fill sequencing date input
      await page
        .locator('input[name="sequencingDate"]')
        .nth(i)
        .type(uploadData.samples[i].sequencingDate);
      // toggle keep private switch
      await page.locator('input[name="keepPrivate"]').nth(i).click();
    }
    //continue button
    await page.locator('a:has-text("Continue")').scrollIntoViewIfNeeded();
    await page.locator('a:has-text("Continue")').click();
  }

  public static async selectSampleFiles(
    page: Page,
    fileName: string
  ): Promise<void> {
    await page.setInputFiles(
      "input[type='file']",
      path.resolve("e2e/fixtures/sampleData" + fileName)
    );
    await page.waitForTimeout(3000);
    // click continue button
    await page.locator('a:has-text("Continue")').click();
  }

  public static createSampleData(): Array<SampleData> {
    return [
      {
        collectionDate: faker.date.recent(10).toISOString().substring(0, 10),
        collectionLocation: "Africa/Angola/Luanda/Calemba",
        isPrivate: true,
        privateId:
          "privateId-" + faker.datatype.number({ min: 1000, max: 9999 }),
        publicId: "publicId-" + faker.datatype.number({ min: 1000, max: 9999 }),
        sequencingDate: faker.date.recent(10).toISOString().substring(0, 10),
      },
      {
        collectionDate: faker.date.recent(10).toISOString().substring(0, 10),
        collectionLocation: "Europe/Russia/Kaluga/Tarusa",
        isPrivate: true,
        privateId:
          "privateId-" + faker.datatype.number({ min: 1000, max: 9999 }),
        publicId: "publicId-" + faker.datatype.number({ min: 1000, max: 9999 }),
        sequencingDate: faker.date.recent(10).toISOString().substring(0, 10),
      },
      {
        collectionDate: faker.date.recent(10).toISOString().substring(0, 10),
        collectionLocation: "Asia/China",
        isPrivate: true,
        privateId:
          "privateId-" + faker.datatype.number({ min: 1000, max: 9999 }),
        publicId: "publicId-" + faker.datatype.number({ min: 1000, max: 9999 }),
        sequencingDate: faker.date.recent(10).toISOString().substring(0, 10),
      },
    ];
  }
}
