import { test, expect} from "@playwright/test";
import { FilterSample } from "../pages/filter";
import path from "path";
import * as dotenv from "dotenv";
import { getByTestID } from "../utils/selectors";
dotenv.config({ path: path.join(__dirname, "../.env") });

const uploadDatePeriods: { [key: string]: number } = {
  "Last 3 Months": 90,
  "Last 30 Days": 30,
  "Last 6 Months": 180,
  "Last 7 Days": 7,
  "Last Year": 365,
};

const collectionDateFrom = "2022-07-01";
const collectionDateTo = "2022-09-01";
const row = "row-collectionDate";
const datesDatesFromGridLocator = "//div[@data-test-id='table-row']/descendant::div[13]";

test.describe("Tests for filtering sample listing view", () => {
  test.beforeEach(async ({ page }, workerInfo) => {
    const baseUrl = workerInfo.config.projects[0].use.baseURL;
    const url = `${baseUrl}/data/samples`;
    await page.goto(url);
  });

  test("Should filter samples by status", async ({ page }) => {
    // define filtering criteria
    const filterBy = {
      status: "complete",
    };
    // filter samples
    await FilterSample.applyFilter(page, filterBy);

    // verify only complete samples are listed
    const sampleStatuses = page.locator("div[status='success'] > span");
    for (let i = 0; i < (await sampleStatuses.count()); i++) {
      expect(sampleStatuses.nth(i)).toHaveText(filterBy.status);
    }
  });

  test("Should filter samples by lineage", async ({ page }) => {
    // define filtering criteria
    const filterBy = {
      lineage: ["BA.1.15"],
    };
    // filter samples
    await FilterSample.applyFilter(page, filterBy);

    // verify only samples with selected lineages displayed
    const sampleLineages = page.locator(".ez2j8c413");
    for (let i = 0; i < (await sampleLineages.count()); i++) {
      const val = await sampleLineages.nth(i).textContent();
      expect(filterBy.lineage).toContain(val);
    }
  });

  test("Should filter by collection date from", async ({ page }) => {
    const filterBy = {
      collectionDateFrom: collectionDateFrom, //changes are required
    };
    // filter samples
    await FilterSample.applyFilter(page, filterBy);

    // verify only samples meeting date criteria are listed
    const filterCollectionDate = new Date(filterBy.collectionDateFrom);

    const sampleCollectionDates = await page.locator(
      getByTestID(row)
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
      collectionDateTo: collectionDateTo, //change as required
    };
    // filter samples
    await FilterSample.applyFilter(page, filterBy);

    // verify only samples meeting date criteria are listed
    const filterCollectionDate = new Date(filterBy.collectionDateTo);

    const sampDates = await page.locator(
      getByTestID(row)
    );
    for (let i = 0; i < (await sampDates.count()); i++) {
      const actuallCollectionDate = new Date(
        (await sampDates.nth(i).textContent()) as string
      );
      const result =
        actuallCollectionDate <= filterCollectionDate ? true : false;
      expect(result).toBeTruthy();
    }
  });

  test("Should filter by collection date from and to", async ({ page }) => {
    const filterBy = {
      collectionDateFrom: collectionDateFrom, //change as required
      collectionDateTo: collectionDateTo,
    };
    // filter samples
    await FilterSample.applyFilter(page, filterBy);

    // convert to date objects for comparison
    const filterCollectionDateFrom = new Date(filterBy.collectionDateFrom);
    const filterCollectionDateTo = new Date(filterBy.collectionDateTo);

    // verify only samples meeting date criteria are listed
    const collections = await page.locator(
      getByTestID(row)
    );
    for (let i = 0; i < (await collections.count()); i++) {
      const actuallCollectionDate = new Date(
        (await collections.nth(i).textContent()) as string
      );
      const dateFromResult =
        actuallCollectionDate >= filterCollectionDateFrom ? true : false;
      const dateToResult =
        actuallCollectionDate <= filterCollectionDateTo ? true : false;
      expect(dateFromResult).toBeFalsy();
      expect(dateToResult).toBeTruthy();
    }
  });

  test("Should filter by collection date periods", async ({ page }) => {
    //test all date options

      const periods = Object.keys(uploadDatePeriods);
      for(const period of periods) {

      const periodValue = uploadDatePeriods[period];
      // filter by collection date period
      await FilterSample.applyFilter(page, { collectionDatePeriod: period });

      //convert period to date object
      const filterCollectionDate = FilterSample.convertDaysToDate(periodValue);

      //verify only samples meeting criteria are listed
      const sampleCol = await page.locator(
        getByTestID(row)
      );
      for (let i = 0; i < (await sampleCol.count()); i++) {
        const actuallCollectionDate = new Date(
          (await sampleCol.nth(i).textContent()) as string
        );
        const result =
          actuallCollectionDate <= filterCollectionDate ? true : false;
       expect(result).toBeFalsy();

      }
    }
  });

  test("Should filter by upload date from", async ({ page }) => {
    const filterBy = {
      uploadDateFrom: collectionDateFrom, //change as required
    };
    // filter samples by upload date from
    await FilterSample.applyFilter(page, filterBy);

    // verify only samples meeting date criteria are listed
    const filterUploadDate = new Date(filterBy.uploadDateFrom);

    const dates = await page.locator(datesDatesFromGridLocator); //todo we need dev help to inject test ids in sample data table
    for (let i = 0; i < (await dates.count()); i++) {
      const actuallUploadDate = new Date(
        (await dates.nth(i).textContent()) as string
      );
      const result = actuallUploadDate >= filterUploadDate ? true : false;
      expect(result).toBeTruthy();
    }
  });

  test("Should filter by upload date to", async ({ page }) => {
    const filterBy = {
      uploadDateTo: collectionDateTo, //changes are required
    };
    // filter samples
    await FilterSample.applyFilter(page, filterBy);

    // verify only samples meeting date criteria are listed
    const filterUploadDate = new Date(filterBy.uploadDateTo);

    const sampleUploadDates = await page.locator(datesDatesFromGridLocator); //todo we need dev help to inject test ids in sample data table

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
      uploadDateTo: collectionDateTo,
    };
    // filter samples
    await FilterSample.applyFilter(page, filterBy);

    // verify only samples meeting date criteria are listed
    const filterUploadDateFrom = new Date(filterBy.uploadDateFrom);
    const filterUploadDateTo = new Date(filterBy.uploadDateTo);

    const samUploadDates = await page.locator(datesDatesFromGridLocator); //todo we need dev help to inject test ids in sample data table
    for (let i = 0; i < (await samUploadDates.count()); i++) {

      const actuallUploadDate = new Date(
        (await samUploadDates.nth(i).textContent()) as string
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
    const periods = Object.keys(uploadDatePeriods);
    for (const period of periods) {
      // filter
      const periodValue = uploadDatePeriods[period];
      await FilterSample.applyFilter(page, { collectionDatePeriod: period });

      //convert period to date object
      const filterUploadDate = await FilterSample.convertDaysToDate(
        periodValue
      );

      //verify sample listing
      const UploadDates = await page.locator(datesDatesFromGridLocator); //todo we need dev help to inject test ids in sample data table
      for (let i = 0; i < (await UploadDates.count()); i++) {

        const actuallUploadDate = new Date(
          (await UploadDates.nth(i).textContent()) as string
        );
        const result = actuallUploadDate >= filterUploadDate ? true : false;
        expect(result).toBeTruthy();
      }
    }
  });

  test("Should filter by multiple fields", async ({ page }) => {
    //todo: change filter values
    const filterBy = {
      collectionDateFrom: collectionDateTo,
      collectionDateTo: collectionDateTo,
      lineage: ["BA.1.15"],
      status: "Complete",
      uploadDateFrom: collectionDateTo,
      uploadDateTo: collectionDateTo,
    };
    // filter
    await FilterSample.applyFilter(page, filterBy);

    //verify sample listing
    const samples = await page.locator(getByTestID("table-row"));
    for (let i = 0; i < (await samples.count()); i++) {
      //verify upload date is within from-to range
      const uploadDateText = (await page
        .locator(datesDatesFromGridLocator)
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
        .locator(getByTestID(row))
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
      await expect(
        page.locator(getByTestID("sample-status")).nth(i)
      ).toHaveText(filterBy.status);
    }
  });
});
