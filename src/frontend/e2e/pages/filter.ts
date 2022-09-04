import { Page } from "@playwright/test";
import { getByID, getByTestID } from "../utils/selectors";

export abstract class FilterSample {
  public static async filter(
    page: Page,
    filterData: Partial<FilterData>
  ): Promise<void> {
    // fill in upload date(s)
    if (
      filterData.uploadDateFrom !== undefined ||
      filterData.uploadDateTo !== undefined
    ) {
      await page.locator("button[label='Upload Date']").click();
      if (filterData.uploadDateFrom !== undefined) {
        page
          .locator("input[name='collectionDateStart']")
          .fill(filterData.uploadDateFrom);
      }
      if (filterData.uploadDateTo !== undefined) {
        page
          .locator("input[name='collectionDateEnd']")
          .fill(filterData.uploadDateTo);
      }
    }
    // select upload date period
    if (filterData.uploadDatePeriod !== undefined) {
      await page.locator("button[label='Upload Date']").click();
      await page
        .locator("div[style*='194'] span > span")
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
        page
          .locator("input[name='collectionDateEnd']")
          .fill(filterData.collectionDateTo);
      }
    }
    // select collection date period
    if (filterData.collectionDatePeriod !== undefined) {
      await page.locator("button[label='Collection Date']").click();
      await page
        .locator("div[style*='194'] span > span")
        .filter({ hasText: filterData.collectionDatePeriod })
        .click();
    }
    // select lineage
    if (filterData.lineage !== undefined) {
      await page.locator("button[label='Lineage']").click();
      await page
        .locator("ul[role='listbox']  .primary-text > div", {
          hasText: filterData.lineage,
        })
        .first()
        .click();
    }
    //apply filter
    await Promise.all([
      page.waitForNavigation(),
      await page
        .locator("//ul[@role='menu']/descendant::button[text()='Apply']")
        .click(),
    ]);
  }

  //convert days into date object based on current date
  public static convertDaysToDate(value: number): Date {
    let today = new Date();
    let filterDate = new Date(today);
    if (value <= 30) {
      filterDate.setDate(filterDate.getDay() - value);
    } else if (value > 30 && value <= 180) {
      filterDate.setMonth(filterDate.getMonth() - value);
    } else {
      filterDate.setFullYear(filterDate.getFullYear() - value);
    }
    return filterDate;
  }
}

export interface FilterData {
  collectionDateFrom: string;
  collectionDateTo: string;
  collectionDatePeriod: string;
  uploadDateFrom: string;
  uploadDateTo: string;
  uploadDatePeriod: string;
  lineage: string;
  status: string;
}
