import * as path from "path";
import dotenv from "dotenv";
import { BasePage } from "../pages/basePage";

dotenv.config({
  path: path.resolve(__dirname, "../../", `.env.${process.env.NODE_ENV}`),
});

//use ignoreLocation flag to skip locations and test validation of other fields
export async function uploadSampleFiles(
  basePage: BasePage,
  uploadData: any,
  ignoreLocation = false
): Promise<any> {
  await selectSampleFiles(basePage, uploadData.fileExtension);

  // complete form
  for (let i = 0; i < uploadData.samples.length; i++) {
    // fill private ID input
    await (await basePage.findByInputName("privateId"))
      .nth(i)
      .type(uploadData.samples[i].private_id);
    // fill public ID input
    await (await basePage.findByInputName("publicId"))
      .nth(i)
      .type(uploadData.samples[i].public_id);
    // fill collection date input
    await (await basePage.findByInputName("collectionDate"))
      .nth(i)
      .fill(uploadData.samples[i].collection_date);

    // select location
    // we will use long delay for location options to populate
    // and use the APPLY TO ALL button
    if (i === 0 && !ignoreLocation) {
      await (await basePage.findElement('span:has-text("Search For Location")'))
        .nth(0)
        .click();
      await (
        await basePage.findByPlaceHolder("Search")
      ).type(uploadData.samples[i].location, { delay: 700 }); //700ms is the optimium time for locations to load in local
      await basePage.pressKey("ArrowDown");
      await basePage.pressEnter();
      await (await basePage.findByText("APPLY TO ALL")).nth(1).click();
    }

    // fill sequencing date input
    await (await basePage.findByInputName("sequencingDate"))
      .nth(i)
      .fill(uploadData.samples[i].sequencing_date);

    // toggle keep private switch
    await (await basePage.findByInputName("keepPrivate")).nth(i).click();
  }
}

export async function selectSampleFiles(
  basePage: BasePage,
  fileExtension: string
): Promise<void> {
  //select file
  await basePage.selectFile(`e2e/fixtures/sampleData.${fileExtension}`);

  //accept site cookies if prompted again
  await basePage.acceptCookies();

  // click continue button
  await (await basePage.findElement('a:has-text("Continue")')).click();
}
