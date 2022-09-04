import { test, expect } from "@playwright/test";
import { FilterSample } from "../pages/filter";
import path from "path";
import * as dotenv from "dotenv";
dotenv.config({ path: path.join(__dirname, "../.env") });

const collectionDatePeriods: { [key: string]: number } = {
  Today: 0,
  Yesterday: 1,
  "Last 7 Days": 7,
};
const uploadDatePeriods = {
  "Last 7 Days": 7,
  "Last 30 Days": 30,
  "Last 3 Months": 90,
  "Last 6 Months": 180,
  "Last Year": 365,
};
test.describe("Tests for filtering sample listing view", () => {
  test.beforeEach(async ({ page }) => {
    //go to samples page
  });

  test("Should filter completed samples", async ({ page }) => {
    // define filtering criteria
    const filterBy = {
      status: "Complete",
    };
    // filter samples
    FilterSample.filter(page, filterBy);

    // verify only comple samples are listed
    const sampleStatuses = page.locator("div[data-test-id='sample-status']");
    for (let i = 0; i < (await sampleStatuses.count()); i++) {
      expect(sampleStatuses.nth(i)).toHaveText(filterBy.status);
    }
  });

  test("Should filter by collection date from", async ({ page }) => {
    const filterBy = {
      collectionDateFrom: "2022-07-01", //changes are required
    };
    // filter samples
    FilterSample.filter(page, filterBy);

    // verify only samples meeting date criteria are listed
    const filterCollectionDate = new Date(filterBy.collectionDateFrom);

    const sampleCollectionDates = page.locator("replace-me");
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
      collectionDateTo: "2022-09-01", //changes are required
    };
    // filter samples
    FilterSample.filter(page, filterBy);

    // verify only samples meeting date criteria are listed
    const filterCollectionDate = new Date(filterBy.collectionDateTo);

    const sampleCollectionDates = page.locator("replace-me");
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
      collectionDateFrom: "2022-07-01", //changes are required
      collectionDateTo: "2022-09-01", //changes are required
    };
    // filter samples
    FilterSample.filter(page, filterBy);

    // verify only samples meeting date criteria are listed
    const filterCollectionDateFrom = new Date(filterBy.collectionDateFrom);
    const filterCollectionDateTo = new Date(filterBy.collectionDateTo);

    const sampleCollectionDates = page.locator("replace-me");
    for (let i = 0; i < (await sampleCollectionDates.count()); i++) {
      const actuallCollectionDate = new Date(
        (await sampleCollectionDates.nth(i).textContent()) as string
      );
      const dateFromResult =
        actuallCollectionDate <= filterCollectionDateFrom ? true : false;
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
      // filter
      FilterSample.filter(page, { collectionDatePeriod: period });

      //convert period to date object
      const filterCollectionDate = FilterSample.convertDaysToDate(periodValue);

      //verify sample listing
      const sampleCollectionDates = page.locator("replace-me");
      for (let i = 0; i < (await sampleCollectionDates.count()); i++) {
        const actuallCollectionDate = new Date(
          (await sampleCollectionDates.nth(i).textContent()) as string
        );
        const result =
          actuallCollectionDate >= filterCollectionDate ? true : false;
        expect(result).toBeTruthy();
      }
    });
  });
});
