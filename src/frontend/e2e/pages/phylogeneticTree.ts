import { Page } from "@playwright/test";
import { TreeInfo } from "../utils/schemas/treeInfo";

let errorCount = 0;
export abstract class PhylogeneticTree {
  public static async fillTreeInfo(
    page: Page,
    treeInfo: TreeInfo
  ): Promise<void> {
    //tree name
    await page.locator("#outlined-basic").type(treeInfo.treeName);
    //check for error message
    if (
      page.locator("span", { hasText: "Name exceeds the 128 character limit." })
    ) {
      errorCount++;
    }

    //tree type
    await page
      .locator(
        `input[value='${treeInfo.treeType.toUpperCase().replace(" ", "_")}']`
      )
      .click();

    //force include sample ids
    if (
      treeInfo.forceIncludedSamples !== undefined &&
      treeInfo.forceIncludedSamples.length > 0
    ) {
      await page
        .locator(
          "//div[contains(@class,'MuiDialog-paperScrollPaper')]/descendant::textarea[not(@aria-hidden='true')]"
        )
        .type(treeInfo.forceIncludedSamples.join());
      await page.locator("//button[text()='Add']").click();

      //check for error message
      if (
        page.locator("span", {
          hasText: "couldn’t be found and will not appear on your tree",
        })
      ) {
        errorCount++;
      }
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
      treeInfo.collectionDate?.from !== undefined ||
      treeInfo.collectionDate?.to !== undefined
    ) {
      await page.locator("p + button[label='All Time']").click();
      // fill date from
      if (treeInfo.collectionDate?.from !== undefined) {
        await page
          .locator(
            "//div[not(@aria-hidden='true') and contains(@class,'MuiPopover-root')]/descendant::input[1]"
          )
          .type(treeInfo.collectionDate?.from);
      }
      // fill date to
      if (treeInfo.collectionDate?.to !== undefined) {
        await page
          .locator(
            "//div[not(@aria-hidden='true') and contains(@class,'MuiPopover-root')]/descendant::input[2]"
          )
          .type(treeInfo.collectionDate?.to);
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
    if (treeInfo.collectionDate?.custom !== undefined) {
      await page.locator("p + button[label='All Time']").click();
      // select collection date
      if (treeInfo.collectionDate?.custom !== undefined) {
        await page
          .locator(`p + button[label='${treeInfo.collectionDate?.custom}']`)
          .click();
      }
    }

    //check for date error message
    if (page.locator("span", { hasText: "Update format to YYYY-MM-DD" })) {
      errorCount++;
    }

    //submit
    if (errorCount <= 0) {
      await page.locator("//button[text()='Create Tree']").click();
    }
  }
}
