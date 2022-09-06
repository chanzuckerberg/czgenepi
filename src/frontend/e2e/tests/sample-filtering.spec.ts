import { test, expect, chromium, Page } from "@playwright/test";
import { FilterSample } from "../pages/filter";
import path from "path";
import * as dotenv from "dotenv";
import { getByTestID } from "../utils/selectors";
dotenv.config({ path: path.join(__dirname, "../.env") });

const collectionDatePeriods: { [key: string]: number } = {
  Today: 0,
  Yesterday: 1,
  "Last 7 Days": 7,
};
const uploadDatePeriods: { [key: string]: number } = {
  "Last 7 Days": 7,
  "Last 30 Days": 30,
  "Last 3 Months": 90,
  "Last 6 Months": 180,
  "Last Year": 365,
};
let page: Page;
test.describe("Tests for filtering sample listing view", () => {
  test.beforeEach(async ({}, workerInfo) => {
    const baseUrl = workerInfo.config.projects[0].use.baseURL;
    const url = `${baseUrl}/data/samples`;
    const browser = await chromium.launch();
    page = await browser.newPage();
    await page.goto(url);
  });

  test("Should filter samples by status", async () => {
    // define filtering criteria
    const filterBy = {
      status: "Complete",
    };
    // filter samples
    FilterSample.applyFilter(page, filterBy);

    // verify only complete samples are listed
    const sampleStatuses = page.locator(getByTestID("sample-status"));
    for (let i = 0; i < (await sampleStatuses.count()); i++) {
      expect(sampleStatuses.nth(i)).toHaveText(filterBy.status);
    }
  });

  test("Should filter samples by lineage", async ({ page }) => {
    // define filtering criteria
    const filterBy = {
      lineage: ["BA1.15"],
    };
    // filter samples
    FilterSample.applyFilter(page, filterBy);

    // verify only samples with selected lineages displayed
    const sampleLineages = page.locator(".ez2j8c413");
    for (let i = 0; i < (await sampleLineages.count()); i++) {
      let val = await sampleLineages.nth(i).textContent();
      expect(filterBy.lineage).toContain(val);
    }
  });

  test("Should filter by collection date from", async ({ page }) => {
    const filterBy = {
      collectionDateFrom: "2022-07-01", //changes are required
    };
    // filter samples
    FilterSample.applyFilter(page, filterBy);

    // verify only samples meeting date criteria are listed
    const filterCollectionDate = new Date(filterBy.collectionDateFrom);

    const sampleCollectionDates = page.locator(
      getByTestID("row-collectionDate")
    );
    for (let i = 0; i < (await sampleCollectionDates.count()); i++) {
      const actuallCollectionDate = new Date(
        (await sampleCollectionDates.nth(i).textContent()) as string
      );
      const result =
        actuallCollectionDate >= filterCollectionDate ? true : false;
      expect(result).toBeTruthy();
    }
  });

  test("Should filter by collection date to", async ({ page }) => {
    const filterBy = {
      collectionDateTo: "2022-09-01", //change as required
    };
    // filter samples
    FilterSample.applyFilter(page, filterBy);

    // verify only samples meeting date criteria are listed
    const filterCollectionDate = new Date(filterBy.collectionDateTo);

    const sampleCollectionDates = page.locator(
      getByTestID("row-collectionDate")
    );
    for (let i = 0; i < (await sampleCollectionDates.count()); i++) {
      const actuallCollectionDate = new Date(
        (await sampleCollectionDates.nth(i).textContent()) as string
      );
      const result =
        actuallCollectionDate <= filterCollectionDate ? true : false;
      expect(result).toBeTruthy();
    }
  });

  test("Should filter by collection date from and to", async ({ page }) => {
    const filterBy = {
      collectionDateFrom: "2022-07-01", //change as required
      collectionDateTo: "2022-09-01",
    };
    // filter samples
    FilterSample.applyFilter(page, filterBy);

    // convert to date objects for comparison
    const filterCollectionDateFrom = new Date(filterBy.collectionDateFrom);
    const filterCollectionDateTo = new Date(filterBy.collectionDateTo);

    // verify only samples meeting date criteria are listed
    const sampleCollectionDates = page.locator(
      getByTestID("row-collectionDate")
    );
    for (let i = 0; i < (await sampleCollectionDates.count()); i++) {
      const actuallCollectionDate = new Date(
        (await sampleCollectionDates.nth(i).textContent()) as string
      );
      const dateFromResult =
        actuallCollectionDate >= filterCollectionDateFrom ? true : false;
      const dateToResult =
        actuallCollectionDate <= filterCollectionDateTo ? true : false;
      expect(dateFromResult).toBeTruthy();
      expect(dateToResult).toBeTruthy();
    }
  });

  test("Should filter by collection date periods", async ({ page }) => {
    //test all date options
    Object.keys(collectionDatePeriods).forEach(async (period) => {
      const periodValue = collectionDatePeriods[period];
      // filter by collection date period
      FilterSample.applyFilter(page, { collectionDatePeriod: period });

      //convert period to date object
      const filterCollectionDate = FilterSample.convertDaysToDate(periodValue);

      //verify only samples meeting criteria are listed
      const sampleCollectionDates = page.locator(
        getByTestID("row-collectionDate")
      );
      for (let i = 0; i < (await sampleCollectionDates.count()); i++) {
        const actuallCollectionDate = new Date(
          (await sampleCollectionDates.nth(i).textContent()) as string
        );
        const result =
          actuallCollectionDate <= filterCollectionDate ? true : false;
        expect(result).toBeTruthy();
      }
    });
  });

  test("Should filter by upload date from", async ({ page }) => {
    const filterBy = {
      uploadDateFrom: "2022-07-01", //change as required
    };
    // filter samples by upload date from
    FilterSample.applyFilter(page, filterBy);

    // verify only samples meeting date criteria are listed
    const filterUploadDate = new Date(filterBy.uploadDateFrom);

    const sampleUploadDates = page.locator(".e2dfs4w5"); //todo we need dev help to inject test ids in sample data table
    for (let i = 0; i < (await sampleUploadDates.count()); i++) {
      const actuallUploadDate = new Date(
        (await sampleUploadDates.nth(i).textContent()) as string
      );
      const result = actuallUploadDate >= filterUploadDate ? true : false;
      expect(result).toBeTruthy();
    }
  });

  test("Should filter by upload date to", async ({ page }) => {
    const filterBy = {
      uploadDateTo: "2022-09-01", //changes are required
    };
    // filter samples
    FilterSample.applyFilter(page, filterBy);

    // verify only samples meeting date criteria are listed
    const filterUploadDate = new Date(filterBy.uploadDateTo);

    const sampleUploadDates = page.locator(".e2dfs4w5"); //todo we need dev help to inject test ids in sample data table
    for (let i = 0; i < (await sampleUploadDates.count()); i++) {
      const actuallUploadDate = new Date(
        (await sampleUploadDates.nth(i).textContent()) as string
      );
      const result = actuallUploadDate <= filterUploadDate ? true : false;
      expect(result).toBeTruthy();
    }
  });

  test("Should filter by from and to upload dates", async ({ page }) => {
    const filterBy = {
      uploadDateFrom: "2022-07-01", //change as required
      uploadDateTo: "2022-09-01",
    };
    // filter samples
    FilterSample.applyFilter(page, filterBy);

    // verify only samples meeting date criteria are listed
    const filterUploadDateFrom = new Date(filterBy.uploadDateFrom);
    const filterUploadDateTo = new Date(filterBy.uploadDateTo);

    const sampleUploadDates = page.locator(".e2dfs4w5"); //todo we need dev help to inject test ids in sample data table
    for (let i = 0; i < (await sampleUploadDates.count()); i++) {
      const actuallUploadDate = new Date(
        (await sampleUploadDates.nth(i).textContent()) as string
      );
      const dateFromResult =
        actuallUploadDate >= filterUploadDateFrom ? true : false;
      const dateToResult =
        actuallUploadDate <= filterUploadDateTo ? true : false;
      expect(dateFromResult).toBeTruthy();
      expect(dateToResult).toBeTruthy();
    }
  });

  test("Should filter by upload date periods", async ({ page }) => {
    //test all date options
    Object.keys(uploadDatePeriods).forEach(async (period) => {
      const periodValue = uploadDatePeriods[period];
      // filter
      FilterSample.applyFilter(page, { collectionDatePeriod: period });

      //convert period to date object
      const filterUploadDate = FilterSample.convertDaysToDate(periodValue);

      //verify sample listing
      const sampleUploadDates = page.locator(".e2dfs4w5"); //todo we need dev help to inject test ids in sample data table
      for (let i = 0; i < (await sampleUploadDates.count()); i++) {
        const actuallUploadDate = new Date(
          (await sampleUploadDates.nth(i).textContent()) as string
        );
        const result = actuallUploadDate >= filterUploadDate ? true : false;
        expect(result).toBeTruthy();
      }
    });
  });

  test("Should filter by multiple fields", async ({ page }) => {
    //todo: change filter values
    const filterBy = {
      collectionDateFrom: "2022-09-01",
      collectionDateTo: "2022-09-01",
      uploadDateFrom: "2022-09-01",
      uploadDateTo: "2022-09-01",
      lineage: ["BA.1.15"],
      status: "Complete",
    };
    // filter
    FilterSample.applyFilter(page, filterBy);

    //verify sample listing
    const samples = page.locator(getByTestID("table-row"));
    for (let i = 0; i < (await samples.count()); i++) {
      //verify upload date is within from-to range
      const uploadDateText = (await page
        .locator(".e2dfs4w5")
        .nth(i)
        .textContent()) as string; //todo we need dev help to inject test ids in sample data table
      const actuallUploadDate = new Date(uploadDateText);
      let dateFromResult =
        actuallUploadDate >= new Date(filterBy.collectionDateFrom)
          ? true
          : false;
      let dateToResult =
        actuallUploadDate <= new Date(filterBy.collectionDateTo) ? true : false;
      expect(dateFromResult).toBeTruthy();
      expect(dateToResult).toBeTruthy();
      //very collection date is within from-to range
      const collectionDateText = (await page
        .locator(getByTestID("row-collectionDate"))
        .nth(i)
        .textContent()) as string;
      const actualCollectionDate = new Date(collectionDateText);
      dateFromResult =
        actualCollectionDate >= new Date(filterBy.collectionDateFrom)
          ? true
          : false;
      dateToResult =
        actualCollectionDate <= new Date(filterBy.collectionDateTo)
          ? true
          : false;
      expect(dateFromResult).toBeTruthy();
      expect(dateToResult).toBeTruthy();
      //verify lineage
      const val = page.locator(".ez2j8c413").nth(i).textContent();
      expect(filterBy.lineage).toContain(val);
      //verify status
      expect(page.locator(getByTestID("sample-status")).nth(i)).toHaveText(
        filterBy.status
      );
    }
  });
});
