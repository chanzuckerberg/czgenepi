import { Page } from "@playwright/test";
import * as path from "path";

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
    await page.locator('span:has-text("Search For Location")').nth(0).click();
    await page
      .locator('[placeholder="Search"]')
      .fill(uploadData.samples[i].location);
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("Enter");

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
