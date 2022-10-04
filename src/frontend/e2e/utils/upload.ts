import { Page } from "@playwright/test";
import * as path from "path";
import dotenv from "dotenv";
import { ENVIRONMENT } from "./constants";

dotenv.config({
  path: path.resolve(__dirname, "../../", `.env.${process.env.NODE_ENV}`),
});

export async function uploadSampleFiles(
  page: Page,
  uploadData: any
): Promise<any> {
  await selectSampleFiles(page, uploadData.dataFile);
  // complete form
  for (let i = 0; i < uploadData.samples.length; i++) {
    // fill private ID input
    await page
      .locator('input[name="privateId"]')
      .nth(i)
      .type(uploadData.samples[i].private_id);
    // fill public ID input
    await page
      .locator('input[name="publicId"]')
      .nth(i)
      .type(uploadData.samples[i].public_id);
    // fill collection date input
    await page
      .locator('input[name="collectionDate"]')
      .nth(i)
      .fill(uploadData.samples[i].collection_date);

    // fill search for location input
    // location dropdown loads very slow in local first time, so we will put a delay
    await page.locator('span:has-text("Search For Location")').nth(0).click();
    if (i === 0 && process.env.NODE_ENV === ENVIRONMENT.DEV) {
      await page.waitForTimeout(10000);
    }
    await page
      .locator('[placeholder="Search"]')
      .type(uploadData.samples[i].location, { delay: 100 });
    await page.keyboard.press("ArrowDown", { delay: 100 });
    await page.keyboard.press("Enter", { delay: 100 });

    // fill sequencing date input
    await page
      .locator('input[name="sequencingDate"]')
      .nth(i)
      .fill(uploadData.samples[i].sequencing_date);

    // toggle keep private switch
    await page.locator('input[name="keepPrivate"]').nth(i).click();
  }
}

export async function selectSampleFiles(
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