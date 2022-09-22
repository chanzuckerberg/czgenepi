import { Page } from "@playwright/test";
export abstract class FilterSample {
  public static async applyFilter(
    page: Page,
    filterData: Partial<FilterData>
  ): Promise<void> {
    // wait for sample page is ready to be handled
    await page.waitForFunction(() => {
      const samples = document.querySelector(
        "a[href$='/data/samples'] > div > div:nth-child(2)"
      )?.textContent;
      return parseInt(samples!) > 0;
    });
    if (
      filterData.uploadDateFrom !== undefined ||
      filterData.uploadDateTo !== undefined
    ) {
      await page.locator("button[label='Upload Date']").click();
      if (filterData.uploadDateFrom !== undefined) {
        await page
          .locator("input[name='uploadDateStart']")
          .fill(filterData.uploadDateFrom);
      }
      if (filterData.uploadDateTo !== undefined) {
        await page
          .locator("input[name='uploadDateEnd']")
          .fill(filterData.uploadDateTo);
      }
      await page
        .locator(
          "//div[not(contains(@style,'visibility: hidden')) and contains(@class,'MuiPaper-root')]/descendant::button[text()='Apply']"
        )
        .click();
    }
    // select upload date period
    if (filterData.uploadDatePeriod !== undefined) {
      await page.locator("button[label='Upload Date']").click();
      await page
        .locator("div:not([style*='hidden'])[class*='MuiPaper-elevation'] li")
        .filter({ hasText: filterData.uploadDatePeriod })
        .click();
    }
    // fill in collection date(s)
    if (
      filterData.collectionDateFrom !== undefined ||
      filterData.collectionDateTo !== undefined
    ) {
      await page.locator("button[label='Collection Date']").click();
      if (filterData.collectionDateFrom !== undefined) {
        page
          .locator("input[name='collectionDateStart']")
          .fill(filterData.collectionDateFrom);
      }
      if (filterData.collectionDateTo !== undefined) {
        await page
          .locator("input[name='collectionDateEnd']")
          .fill(filterData.collectionDateTo);
      }
      await page
        .locator(
          "//div[not(contains(@style,'visibility: hidden')) and contains(@class,'MuiPaper-root')]/descendant::button[text()='Apply']"
        )
        .click();
    }
    // select collection date period
    if (filterData.collectionDatePeriod !== undefined) {
      await page.locator("button[label='Collection Date']").click();
      await page
        .locator("div:not([style*='hidden'])[class*='MuiPaper-elevation'] li")
        .filter({ hasText: filterData.collectionDatePeriod })
        .click();
    }
    // select lineage
    if (filterData.lineage !== undefined) {
      await page.locator("button[label='Lineage']").click();
      for (const singleLineage of filterData.lineage) {
        await page.locator("div[role='tooltip'] input").fill(singleLineage);
        await page
          .locator("ul[role='listbox']  .primary-text > div", {
            hasText: singleLineage,
          })
          .first()
          .click();
      }
      await page.keyboard.press("Escape"); //dismiss form
    }
  }

  //convert days into date object based on current date
  public static convertDaysToDate(value: number): Date {
    const today = new Date();
    const filterDate = new Date(today);
    if (value <= 30) {
      filterDate.setDate(filterDate.getDay() - value);
    } else if (value > 30 && value <= 180) {
      filterDate.setMonth(filterDate.getMonth() - value);
    } else {
      filterDate.setFullYear(filterDate.getFullYear() - value);
    }
    return filterDate;
  }

  public static async getStatusBySampleName(page: Page ,sampleName: string): Promise<string>{
   return await page.locator("//span[text()='${VAR}']/following-sibling::div/span".replace('${VAR}',sampleName)).textContent() as string;
  }
  
  public static async filterByLineage(page: Page, lineage: string) {
      await page.waitForFunction(sample => !! document.querySelector(sample),"div[data-test-id='table-row']:nth-last-child(1)");
      await page.locator("//span[text()='Lineage']").click();
      await page.locator("//div[@role='presentation']/descendant::div[text()='${VAR}']".replace('${VAR}',lineage)).click();
      await page.keyboard.press('Escape');
  }

  public static async removeSelectedFilter(page: Page){
    await page.locator("svg[class*='MuiChip-deleteIcon']").click();
  }

  public static async getColumnContent(page: Page, textFiltered: string): Promise<string[]>{
   return await page.locator("//div[@data-test-id='table-row']/descendant::div[text()='${VAR}']".replace('${VAR}',textFiltered)).allTextContents();
  }

  public static async filterBycollectionDate(page: Page, collectionDatePeriod: string){
    await page.locator("//span[text()='Collection Date']").click();
    await page.locator("//div[not(contains(@style,'hidden'))]/ul//descendant::span[text()='${VAR}']".replace('${VAR}',collectionDatePeriod)).click();
  }

  public static async filterByUploadDate(page:Page, uploadDate: string){
    await page.locator("//span[text()='Upload Date']").click();
    await page.locator("//div[not(contains(@style,'hidden'))]/ul//descendant::span[text()='${VAR}']".replace('${VAR}',uploadDate)).click();
  }


}

export interface FilterData {
  collectionDateFrom: string;
  collectionDateTo: string;
  collectionDatePeriod: string;
  uploadDateFrom: string;
  uploadDateTo: string;
  uploadDatePeriod: string;
  lineage: Array<string>;
  status: string;
}
