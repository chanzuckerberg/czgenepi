import { Page } from "@playwright/test";
const applyCollectionDateSelector =
  "​to​ApplyLast 7 DaysLast 30 DaysLast 3 MonthsLast 6 MonthsLast Year";
const applyUploadDateSelector = "to​ApplyTodayYesterdayLast 7 Days";
export abstract class FilterSample {
  public static async applyFilter(
    page: Page,
    filterData: Partial<FilterData>
  ): Promise<void> {
    // wait for sample page is ready to be handled
    // this wait is deleted in another PR. Pls disregard
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
        .locator(`text=${applyUploadDateSelector} >> [data-testid="button"]`)
        .click();
    }
    // select upload date period
    if (filterData.uploadDatePeriod !== undefined) {
      await page.locator("button[label='Upload Date']").click();
      await page.locator(`text=${filterData.uploadDatePeriod}`).nth(0).click();
    }
    // fill in collection date(s)
    if (
      filterData.collectionDateFrom !== undefined ||
      filterData.collectionDateTo !== undefined
    ) {
      await page.locator("button[label='Collection Date']").click();
      if (filterData.collectionDateFrom !== undefined) {
        await page
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
          `text=${applyCollectionDateSelector} >> [data-testid="button"]`
        )
        .click();

      //dismiss form
      await page.keyboard.press("Escape");
    }
    // select collection date period
    if (filterData.collectionDatePeriod !== undefined) {
      await page.locator("button[label='Collection Date']").click();
      await page
        .locator(`text=${filterData.collectionDatePeriod}`)
        .nth(1)
        .click();
    }
    // select lineage(s)
    if (filterData.lineage !== undefined) {
      await page.locator('button:has-text("Lineage")').click();
      await page
        .locator('text=Search for a location​ >> [placeholder="Search"]')
        .click();
      for (const singleLineage of filterData.lineage) {
        await page
          .locator('text=Search for a location​ >> [placeholder="Search"]')
          .fill(singleLineage);
        await page
          .locator(`div[role="menuitem"] >> text=${singleLineage}`)
          .click();
      }
      //dismiss form
      await page.keyboard.press("Escape");
    }
    // select status
    if (filterData.status !== undefined) {
      await page.locator('button:has-text("Genome Recovery")').click();
      await page.locator(`text="${filterData.status}"`).click();
      //dismiss form
      await page.keyboard.press("Escape");
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
