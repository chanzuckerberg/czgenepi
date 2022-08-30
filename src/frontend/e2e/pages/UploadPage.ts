import { Locator, Page } from "@playwright/test";
import { SampleData } from "../utils/schemas/sampleData";

export class UploadPage {
  readonly page: Page;
  readonly selectSampleFiles: Locator;
  readonly continueButton: Locator;
  readonly cancelButton: Locator;
  readonly removeAll: Locator;
  readonly samplePrivateId: string;
  readonly samplePublicId: string;
  readonly sampleCollectionDate: string;
  readonly sampleCollectionLocation: string;
  readonly sampleSequencingDate: string;
  readonly samplePrivateSwitch: string;
  readonly importedFileNameList: Locator;
  readonly collectionDateInvalidFormatMsg: string;
  readonly sequencingDateInvalidFormatMsg: string;
  readonly submitSamplesButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.selectSampleFiles = page.locator("input[type='file']");
    this.continueButton = page.locator("a[href$='/upload/2'] > button");
    this.cancelButton = page.locator("a[href$='/data/samples'] > button");
    this.removeAll = page.locator(
      ".MuiButton-textPrimary > .MuiButton-label > .MuiButton-iconSizeMedium"
    );
    this.samplePrivateId =
      "//div[div[text()='${VAR}']]/following-sibling::div/descendant::input[@name='privateId']";
    this.samplePublicId =
      "//div[div[text()='${VAR}']]/following-sibling::div/descendant::input[@name='publicId']";
    this.sampleCollectionDate =
      "//div[div[text()='${VAR}']]/following-sibling::div/descendant::input[@name='collectionDate']";
    this.sampleCollectionLocation =
      "//div[div[text()='${VAR}']]/following-sibling::div/descendant::button[@label='Search For Location']";
    this.sampleSequencingDate =
      "//div[div[text()='${VAR}']]/following-sibling::div/descendant::input[@name='sequencingDate']";
    this.samplePrivateSwitch =
      "//div[div[text()='${VAR}']]/following-sibling::div/descendant::input[@name='keepPrivate']";
    this.importedFileNameList = page.locator(
      "div[role='table'] div[role='rowgroup']:nth-of-type(2) .MuiTableCell-alignLeft"
    );
    this.collectionDateInvalidFormatMsg =
      "//div[div[text()='${VAR}']]/following-sibling::div/descendant::input[@name='collectionDate']/../following-sibling::p";
    this.sequencingDateInvalidFormatMsg =
      "//div[div[text()='${VAR}']]/following-sibling::div/descendant::input[@name='sequencingDate']/../following-sibling::p";
    this.submitSamplesButton = page.locator("a[href$='/upload/3'] > button");
  }

  async uploadSampleFiles(fileName: string) {
    await this.page.setInputFiles(
      "input[type='file']",
      "/Users/lbrambila/projects/czgenepi/src/frontend/e2e/files/" + fileName
    );
  }

  async removeAllImportedFiles() {
    await this.removeAll.click();
  }

  async clickContinue() {
    await this.continueButton.click();
    await this.page.waitForSelector(
      "form div[role='table'] > .MuiTableBody-root"
    );
  }

  async getImportedFileNameList(): Promise<string[]> {
    for (let i = 0; i < (await this.importedFileNameList.count()); i++) {
      console.log(
        "NAME " + (await this.importedFileNameList.nth(i).textContent())
      );
    }
    return this.importedFileNameList.allTextContents();
  }

  async fillSampleInfo(sampleName: string, sampleData: SampleData) {
    await this.page
      .locator(this.samplePrivateId.replace("${VAR}", sampleName))
      .click();
    while (
      (await this.page
        .locator(this.samplePrivateId.replace("${VAR}", sampleName))
        .getAttribute("value")) !== ""
    ) {
      await this.page.keyboard.press("Backspace");
      await this.page.keyboard.press("Delete");
    }
    await this.page
      .locator(this.samplePrivateId.replace("${VAR}", sampleName))
      .type(sampleData.privateId);
    await this.page
      .locator(this.samplePublicId.replace("${VAR}", sampleName))
      .type(sampleData.publicId);
    await this.page
      .locator(this.sampleCollectionDate.replace("${VAR}", sampleName))
      .type(sampleData.collectionDate);
    await this.page
      .locator(this.sampleCollectionLocation.replace("${VAR}", sampleName))
      .click();
    await this.page
      .locator("//div[@role='tooltip']/descendant::input")
      .type(sampleData.collectionLocation, { delay: 150 });
    await this.page.keyboard.press("ArrowDown");
    await this.page.keyboard.press("Enter");
    await this.page
      .locator(this.sampleSequencingDate.replace("${VAR}", sampleName))
      .type(sampleData.sequencingDate);
    if (sampleData.isPrivate === true) {
      await this.page
        .locator(this.samplePrivateSwitch.replace("${VAR}", sampleName))
        .click();
    }
  }

  async getCollectionDateInvalidFormatMessage(
    sampleName: string
  ): Promise<string | null> {
    return this.page
      .locator(
        this.collectionDateInvalidFormatMsg.replace("${VAR}", sampleName)
      )
      .textContent();
  }

  async getsequencingDateInvalidFormatMessage(
    sampleName: string
  ): Promise<string | null> {
    return this.page
      .locator(
        this.sequencingDateInvalidFormatMsg.replace("${VAR}", sampleName)
      )
      .textContent();
  }
}
