import { Locator, Page } from "@playwright/test";
import { TreeInfo } from "../utils/schemas/treeInfo";

const inputIdentifier = "//div[@role='tooltip']/descendant::input";

export class PhylogeneticTreePage {
  readonly page: Page;

  readonly treeNameInput: Locator;
  readonly overviewRatioButton: Locator;
  readonly targetedRatioButton: Locator;
  readonly nonContextualizedRatioButton: Locator;
  readonly lineageDropDown: Locator;
  readonly collectionDateDropDown: Locator;
  readonly forcedIncludeTextArea: Locator;
  readonly addForcedSamplesButton: Locator;
  readonly createTreeButton: Locator;
  readonly radiosTreeType: Locator;
  readonly errorToolTip: Locator;
  readonly exceedNumberOfCharsErrorMsg: Locator;
  readonly sampleWarningMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    this.treeNameInput = page.locator("#outlined-basic");
    this.overviewRatioButton = page.locator("input[value='OVERVIEW']");
    this.targetedRatioButton = page.locator("input[value='TARGETED']");
    this.nonContextualizedRatioButton = page.locator(
      "input[value='NON_CONTEXTUALIZED']"
    );
    this.lineageDropDown = page.locator("p + button[label='All']");
    this.collectionDateDropDown = page.locator("p + button[label='All Time']");
    this.forcedIncludeTextArea = page.locator(
      "//div[contains(@class,'MuiDialog-paperScrollPaper')]/descendant::textarea[not(@aria-hidden='true')]"
    );
    this.addForcedSamplesButton = page.locator("//button[text()='Add']");
    this.createTreeButton = page.locator("//button[text()='Create Tree']");
    this.radiosTreeType = page.locator("span[class*='Radio'] > input");
    this.errorToolTip = page.locator("//div[@role='tooltip']/div");
    this.exceedNumberOfCharsErrorMsg = page.locator(
      "//div[text()='Name exceeds the 128 character limit.']"
    );
    this.sampleWarningMessage = page.locator(
      "//div[contains(@class,'MuiDialog-paperScrollPaper')]/descendant::div[contains(@class,'MuiAlert-messag')]/descendant::span[1]"
    );
  }

  async fillTreeInfo(treeInfo: TreeInfo) {
    await this.treeNameInput.type(treeInfo.treeName);
    const types = await this.radiosTreeType.evaluateAll((radios) =>
      radios.map((element) => element.getAttribute("value"))
    );
    if (treeInfo.treeType.length > 0) {
      for (let i = 0; i < types.length; i++) {
        if (treeInfo.treeType.toUpperCase() === types[i]) {
          //    await this.page.locator('//input[contains(@value,"${VAR}")]'.replace('${VAR}',treeInfo.treeType)).click();
          await this.page
            .locator(
              `.MuiFormGroup-root > label:nth-of-type(${i + 1}) > span > input`
            )
            .click();
        }
      }
    }
    if (Array.isArray(treeInfo.lineage)) {
      await this.lineageDropDown.click();
      for (let j = 0; j < treeInfo.lineage.length; j++) {
        await this.page.locator(inputIdentifier).type(treeInfo.lineage[j]);
        const lineageOption =
          "//div[@role='menuitem']/descendant::div[text()='${VAR}']".replace(
            "${VAR}",
            treeInfo.lineage[j]
          );
        await this.page.locator(lineageOption).click();
        await this.page.locator(inputIdentifier).click();
        while (
          (await this.page.locator(inputIdentifier).getAttribute("value")) !==
          ""
        ) {
          await this.page.keyboard.press("Backspace");
          await this.page.keyboard.press("Delete");
        }
      }
      await this.page.keyboard.press("Escape");
    }
    if (typeof (await treeInfo.collectionDate) === "string") {
      await this.collectionDateDropDown.click();
      await this.page
        .locator(
          "//div[not(@aria-hidden='true') and contains(@class,'MuiPopover-root')]/descendant::span[text()='${VAR}']".replace(
            "${VAR}",
            treeInfo.collectionDate
          )
        )
        .click();
    } else if (Array.isArray(await treeInfo.collectionDate)) {
      await this.collectionDateDropDown.click();
      await this.page
        .locator(
          "//div[not(@aria-hidden='true') and contains(@class,'MuiPopover-root')]/descendant::input[1]"
        )
        .type(treeInfo.collectionDate[0]);
      await this.page
        .locator(
          "//div[not(@aria-hidden='true') and contains(@class,'MuiPopover-root')]/descendant::input[2]"
        )
        .type(treeInfo.collectionDate[1]);
      await this.page
        .locator(
          "//div[not(@aria-hidden='true') and contains(@class,'MuiPopover-root')]/descendant::button"
        )
        .click();
    }
    if (typeof treeInfo.forceIncludedSamples === "string") {
      await this.forcedIncludeTextArea.type(treeInfo.forceIncludedSamples);
      await this.addForcedSamplesButton.click();
    }
  }

  async submitTreeinfo() {
    await this.createTreeButton.click();
  }

  async createTree(treeInfo: TreeInfo) {
    await this.fillTreeInfo(treeInfo);
    await this.submitTreeinfo();
  }

  async getToolTipErrorMsg(): Promise<string> {
    await this.createTreeButton.hover({ force: true });
    return (await this.errorToolTip.textContent()) as string;
  }

  async getExceedNumberCharactersErrorMsg(): Promise<string> {
    return (await this.exceedNumberOfCharsErrorMsg.textContent()) as string;
  }

  async getSampleWarningMsg(): Promise<string> {
    return (await this.sampleWarningMessage.textContent()) as string;
  }
}
