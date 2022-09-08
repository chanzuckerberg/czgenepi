import { Locator, Page } from "@playwright/test";
import { TreeInfo } from "../utils/schemas/treeInfo";

const inputIdentifier = "//div[@role='tooltip']/descendant::input";

export abstract class PhylogeneticTree {
  // readonly page: Page;

  // readonly treeNameInput: Locator;
  // readonly overviewRatioButton: Locator;
  // readonly targetedRatioButton: Locator;
  // readonly nonContextualizedRatioButton: Locator;
  // readonly lineageDropDown: Locator;
  // readonly collectionDateDropDown: Locator;
  // readonly forcedIncludeTextArea: Locator;
  // readonly addForcedSamplesButton: Locator;
  // readonly createTreeButton: Locator;
  // readonly radiosTreeType: Locator;
  // readonly errorToolTip: Locator;
  // readonly exceedNumberOfCharsErrorMsg: Locator;
  // readonly sampleWarningMessage: Locator;

  // constructor(page: Page) {
  //   this.page = page;
  //   this.treeNameInput = page.locator("#outlined-basic");
  //   this.overviewRatioButton = page.locator("input[value='OVERVIEW']");
  //   this.targetedRatioButton = page.locator("input[value='TARGETED']");
  //   this.nonContextualizedRatioButton = page.locator(
  //     "input[value='NON_CONTEXTUALIZED']"
  //   );
  //   this.lineageDropDown = page.locator("p + button[label='All']");
  //   this.collectionDateDropDown = page.locator("p + button[label='All Time']");
  //   this.forcedIncludeTextArea = page.locator(
  //     "//div[contains(@class,'MuiDialog-paperScrollPaper')]/descendant::textarea[not(@aria-hidden='true')]"
  //   );
  //   this.addForcedSamplesButton = page.locator("//button[text()='Add']");
  //   this.createTreeButton = page.locator("//button[text()='Create Tree']");
  //   this.radiosTreeType = page.locator("span[class*='Radio'] > input");
  //   this.errorToolTip = page.locator("//div[@role='tooltip']/div");
  //   this.exceedNumberOfCharsErrorMsg = page.locator(
  //     "//div[text()='Name exceeds the 128 character limit.']"
  //   );
  //   this.sampleWarningMessage = page.locator(
  //     "//div[contains(@class,'MuiDialog-paperScrollPaper')]/descendant::div[contains(@class,'MuiAlert-messag')]/descendant::span[1]"
  //   );
  // }

  public static async fillTreeInfo(
    page: Page,
    treeInfo: TreeInfo
  ): Promise<void> {
    //tree name
    await page.locator("#outlined-basic").type(treeInfo.treeName);

    //tree type
    await page
      .locator(
        `input[value='${treeInfo.treeType.toUpperCase().replace(" ", "_")}']`
      )
      .click();

    //force include sample ids
    if (treeInfo.forceIncludedSamples.length > 0) {
      await page
        .locator(
          "//div[contains(@class,'MuiDialog-paperScrollPaper')]/descendant::textarea[not(@aria-hidden='true')]"
        )
        .type(treeInfo.forceIncludedSamples.join());
      await page.locator("//button[text()='Add']").click();
    }

    //lineage
    if (treeInfo.treeType === "Overview") {
      if (treeInfo.lineage[0] !== "All") {
        //option 'All' is default so we don't have to do anything
        await page.locator("p + button[label='All']").click();
        // select alineage values
        for (let i = 0; i < treeInfo.lineage.length; i++) {
          //search and select by clearing existing value and typing searched lineage
          await page
            .locator("//div[@role='tooltip']/descendant::input")
            .fill("");
          await page
            .locator("//div[@role='tooltip']/descendant::input")
            .type(treeInfo.lineage[i]);
          await page
            .locator(`p + button[label='${treeInfo.lineage[i]}']`)
            .click();
        }
        //close dropdown
        await page.keyboard.press("Escape");
      }
    }
    //collection date from/to
    if (
      treeInfo.collectionDateFrom !== undefined ||
      treeInfo.collectionDateTo !== undefined
    ) {
      await page.locator("p + button[label='All Time']").click();
      // fill date from
      if (treeInfo.collectionDateFrom !== undefined) {
        await page
          .locator(
            "//div[not(@aria-hidden='true') and contains(@class,'MuiPopover-root')]/descendant::input[1]"
          )
          .type(treeInfo.collectionDateFrom);
      }
      // fill date to
      if (treeInfo.collectionDateTo !== undefined) {
        await page
          .locator(
            "//div[not(@aria-hidden='true') and contains(@class,'MuiPopover-root')]/descendant::input[2]"
          )
          .type(treeInfo.collectionDateTo);
      }
      // click apply button
      await page
        .locator(
          "//div[not(@aria-hidden='true') and contains(@class,'MuiPopover-root')]/descendant::button"
        )
        .click();
      await page.keyboard.press("Escape");
    }
    // collection date period
    if (treeInfo.collectionDatePeriod !== undefined) {
      await page.locator("p + button[label='All Time']").click();
      // select collection date
      if (treeInfo.collectionDatePeriod !== undefined) {
        await page
          .locator(`p + button[label='${treeInfo.collectionDatePeriod}']`)
          .click();
      }
    }

    //submit
    await page.locator("//button[text()='Create Tree']").click();
  }

  // async submitTreeinfo() {
  //   await this.createTreeButton.click();
  // }

  // async createTree(treeInfo: TreeInfo) {
  //   await this.fillTreeInfo(treeInfo);
  //   await this.submitTreeinfo();
  // }

  // async getToolTipErrorMsg(): Promise<string> {
  //   await this.createTreeButton.hover({ force: true });
  //   return (await this.errorToolTip.textContent()) as string;
  // }

  // async getExceedNumberCharactersErrorMsg(): Promise<string> {
  //   return (await this.exceedNumberOfCharsErrorMsg.textContent()) as string;
  // }

  // async getSampleWarningMsg(): Promise<string> {
  //   return (await this.sampleWarningMessage.textContent()) as string;
  // }
}
