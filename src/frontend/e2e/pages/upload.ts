import { Page } from "@playwright/test";
import { faker } from "@faker-js/faker";
import { Sample } from "../utils/schemas/sampleData";
import { UploadData } from "../utils/schemas/uploadData";

export class UploadSample {
  public static async uploadFiles(
    page: Page,
    uploadData: UploadData,
    collectionDateError = false,
    sequencingDateError = false
  ): Promise<any> {
    //click upload button
    await page.locator("a[href$='/upload/step1']").click();
    //TODO verify URL

   await UploadSample.selectSampleAndMetadaFiles(page, uploadData);

    //complete the form
    let collectionDateAppliedToAll = false;
    let collectionLocationAppliedToAll = false;
    let sequencingDateAppliedToAll = false;
    for (let i = 0; i <= uploadData.sample.length; i++) {
      const data = uploadData.sample[i];
      type key = keyof typeof data;
      //update public id                                             data.publicId
      await page.locator("input[@name='publicId']").nth(i).type(data['publicId' as key]);
      //collection date
      if (!collectionDateAppliedToAll) {
        // apply to all has not been applied, so fill it
        await page
          .locator("input[@name='collectionDate']")
          .nth(i) //data.collectionDate
          .type(data['collectionDate' as key]);
        if (uploadData.applyToAll && !collectionDateError) {
          await page.locator("button[@label='APPLY TO ALL']").nth(i).click();
          collectionDateAppliedToAll = true;
        }
      }

      //location
      if (!collectionLocationAppliedToAll) {
        // apply to all has not been applied, so fill it
        await page
          .locator("button[@label='Search For Location']")
          .nth(i)
          .click();
        await page
          .locator("//div[@role='tooltip']/descendant::input")
          .nth(i)//collectionLocation
          .type(data['collectionLocation' as key], { delay: 150 });
        await page.keyboard.press("ArrowDown");
        await page.keyboard.press("Enter");
        if (uploadData.applyToAll) {
          await page
            .locator("button[@label='APPLY TO ALL']")
            .nth(i + 1)
            .click();
          collectionLocationAppliedToAll = true;
        }
      }

      //sequencing date
      if (!sequencingDateAppliedToAll) {
        // apply to all has not been applied, so fill it
        await page
          .locator("input[@name='sequencingDate']")
          .nth(i)//sequencingDate
          .type(data['sequencingDate' as key]);
        if (uploadData.applyToAll && !sequencingDateError) {
          await page
            .locator("button[@label='APPLY TO ALL']")
            .nth(i + 2)
            .click();
          sequencingDateAppliedToAll = true;
        }
      }

      //private sample
      if (data['isPrivate' as key]) {
        await page.locator("input[@name='keepPrivate']").nth(i).click();
      }
    }

    //return collection date errors
    if (collectionDateError) {
      return await page.locator(
        "input[@name='collectionDate']/../following-sibling::p"
      );
    }
    //return sequencing date erros
    if (sequencingDateError) {
      return await page.locator(
        "input[@name='sequencingDate']/../following-sibling::p"
      );
    }

    //continue
    if (!collectionDateError && !sequencingDateError) {
      await page.locator("button[@label='Continue']").click();
      //TODO verify URL

      //consent and confirm
      await page.locator("input[@type='checkbox']").first().click();
      await page.locator("input[@type='checkbox']").last().click();
      //TODO verify URL

      // submit
      await page.locator("button[@label='Start Upload']").click();
      //TODO verify data submitted
    }
  }

  public static async selectSampleAndMetadaFiles(
    page: Page,
    uploadData: UploadData
  ): Promise<void> {
    // click select sample files button
    const [fileChooser] = await Promise.all([
     await page.waitForEvent("filechooser"),
     await page.locator("//button[text()='Select Sample Files']").click(),
    ]);
    // select sample files
    await fileChooser.setFiles(
      UploadSample.getFullSampleFilePaths(uploadData?.dataFiles)
    );

    // click continue button
    await page.locator("button[@label='Continue']").click();
    await page.waitForSelector("form div[role='table'] > .MuiTableBody-root");
    //TODO verify URL

    //select metadata file
    if (uploadData?.metadataFile !== undefined) {
      const [fileChooser] = await Promise.all([
        page.waitForEvent("filechooser"),
        await page.locator("button[@label='Select Metadata File']").click(),
      ]);
      // select metadata file
      await fileChooser.setFiles([`../fixtures${uploadData?.metadataFile}`]);
    }
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
  public static getSampleData(): Array<Sample> {
    return [
      {
        collectionDate: "2022-08-01",
        collectionLocation: "Africa/Angola/Luanda/Calemba",
        privateId: faker.datatype.string(8),
        publicId: faker.datatype.string(8),
        sequencingDate: faker.date.recent(10).toISOString().substring(0, 10),
        isPrivate: true,
      },
      {
        collectionDate: "2022-08-01",
        collectionLocation: "Africa/Angola/Luanda/Calemba",
        privateId: faker.datatype.string(8),
        publicId: faker.datatype.string(8),
        sequencingDate: faker.date.recent(10).toISOString().substring(0, 10),
        isPrivate: true,
      },
    ];
  }
}
