import { Page } from "@playwright/test";

export async function applyFilter(
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
}

//convert days into date object based on current date
export function convertDaysToDate(value: number): Date {
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
