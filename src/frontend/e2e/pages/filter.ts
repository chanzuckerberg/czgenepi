import { BasePage } from "../pages/basePage";

const applyCollectionDateSelector =
  "​to​ApplyLast 7 DaysLast 30 DaysLast 3 MonthsLast 6 MonthsLast Year";
const applyUploadDateSelector = "to​ApplyTodayYesterdayLast 7 Days";

export async function applyFilter(
  base: BasePage,
  filterData: Partial<FilterData>
): Promise<void> {
  if (
    filterData.uploadDateFrom !== undefined ||
    filterData.uploadDateTo !== undefined
  ) {
    await base.clickByTypeAndLabel("button", "Upload Date");
    if (filterData.uploadDateFrom !== undefined) {
      await base.fillByTypeAndName(
        "input",
        "uploadDateStart",
        filterData.uploadDateFrom
      );
    }
    if (filterData.uploadDateTo !== undefined) {
      await base.fillByTypeAndName(
        "input",
        "uploadDateEnd",
        filterData.uploadDateTo
      );
    }
    await base.clickByText(
      `${applyUploadDateSelector} >> [data-testid="button"]`
    );
  }
  // select upload date period
  if (filterData.uploadDatePeriod !== undefined) {
    await base.clickByTypeAndLabel("button", "Upload Date");
    await (await base.findByText(`${filterData.uploadDatePeriod}`))
      .nth(0)
      .click();
  }
  // fill in collection date(s)
  if (
    filterData.collectionDateFrom !== undefined ||
    filterData.collectionDateTo !== undefined
  ) {
    await (await base.findByTypeAndLabel("button", "Collection Date")).click();
    if (filterData.collectionDateFrom !== undefined) {
      await base.fillByTypeAndName(
        "input",
        "collectionDateStart",
        filterData.collectionDateFrom
      );
    }
    if (filterData.collectionDateTo !== undefined) {
      await base.fillByTypeAndName(
        "input",
        "collectionDateEnd",
        filterData.collectionDateTo
      );
    }
    await base.clickByText(
      `${applyCollectionDateSelector} >> [data-testid="button"]`
    );

    //dismiss form
    await base.pressEsc();
  }
  // select collection date period
  if (filterData.collectionDatePeriod !== undefined) {
    await base.clickByTypeAndLabel("button", "Collection Date");
    await (await base.findByText(`${filterData.collectionDatePeriod}`))
      .nth(1)
      .click();
  }
  // select lineage(s)
  if (filterData.lineage !== undefined) {
    const searchLocator = 'Search for a location​ >> [placeholder="Search"]';
    await base.clickElement('button:has-text("Lineage")');
    for (const singleLineage of filterData.lineage) {
      await base.fillByText(searchLocator, singleLineage);
      await base.clickElement(`div[role="menuitem"] >> text=${singleLineage}`);
    }
    //dismiss form
    await base.pressEsc();
  }
  // select status
  if (filterData.status !== undefined) {
    await base.clickElement('button:has-text("Genome Recovery")');
    await base.clickElement(`ul[role="listbox"] >> text=${filterData.status}`);
    //dismiss form
    await base.pressEsc();
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
