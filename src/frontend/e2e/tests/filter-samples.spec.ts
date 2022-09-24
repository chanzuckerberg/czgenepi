import { expect, test, Page } from "@playwright/test";
import { getSampleResponseData, SampleResponseDefaults } from "../utils/sample";
import { applyFilter, convertDaysToDate } from "../pages/filter";
import path from "path";
import * as dotenv from "dotenv";
import { getByTestID } from "../utils/selectors";
import { getADateInThePast } from "../utils/common";

dotenv.config({
  path: path.resolve(__dirname, "../../", `.env.${process.env.NODE_ENV}`),
});

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
const datesDatesFromGridLocator =
  "//div[@data-test-id='table-row']/descendant::div[13]";

test.describe("Sample filtering tests", () => {
  let url = "";
  const api = `${process.env.BASEAPI}/v2/orgs/${process.env.GROUPID}/pathogens/SC2/samples/`;

  const mockData = {
    samples: prepareTestData(),
  };
  //console.log(JSON.stringify(mockData));
  test.beforeEach(async ({ page }, workerInfo) => {
    const baseUrl = workerInfo.config.projects[0].use.baseURL;
    url = `${baseUrl}/data/samples`;
    await page.goto(url);
  });

  test("Should filter samples by 'Complete' status", async ({
    page,
    context,
  }) => {
    // define filtering criteria
    const filterBy = {
      status: "complete",
    };
    // filter samples
    await applyFilter(page, filterBy);

    //create an intercept to stub response with mock data once we get response with status 200
    await context.route(api, async (route) => {
      const response = await context.request.get(api);
      //check we get response 200, but we could also abort the call (route.abort() : route.continue();)
      expect(response.ok()).toBeTruthy();
      //retain original response but replace body part with stubbed data we created
      route.fulfill({
        response,
        body: JSON.stringify(mockData),
      });
    });
    // make the actual, wait until all responses have been received
    await page.goto(url, { waitUntil: "networkidle" });

    //wait until data is displayed
    await waitForDataToBeDisplayed(page);

    // verify only complete samples are listed
    const sampleStatuses = page.locator('[data-test-id="sample-status"]');
    expect(await sampleStatuses.count()).toBe(2); //we earlier prepared 2 samples with complete status
    for (let i = 0; i < (await sampleStatuses.count()); i++) {
      expect(sampleStatuses.nth(i)).toHaveText(filterBy.status);
    }

    // for debugging only
    await page.screenshot({ path: "screenshot.png", fullPage: true });
  });

  test("Should filter samples by status", async ({ page }) => {
    // define filtering criteria
    const filterBy = {
      status: "complete",
    };
    // filter samples
    await applyFilter(page, filterBy);

    // verify only complete samples are listed
    const sampleStatuses = page.locator("div[status='success'] > span");
    for (let i = 0; i < (await sampleStatuses.count()); i++) {
      expect(sampleStatuses.nth(i)).toHaveText(filterBy.status);
    }
  });

  test.only("Should filter samples by lineage", async ({ page, context }) => {
    // define filtering criteria
    const filterBy = {
      lineage: ["BA.1.15"],
    };

    //create an intercept to stub response with mock data once we get response with status 200
    await context.route(api, async (route) => {
      const response = await context.request.get(api);
      //check we get response 200, but we could also abort the call (route.abort() : route.continue();)
      expect(response.ok()).toBeTruthy();
      //retain original response but replace body part with stubbed data we created
      route.fulfill({
        response,
        body: JSON.stringify(mockData),
      });
    });
    // make the actual, wait until all responses have been received
    await page.goto(url, { waitUntil: "networkidle" });

    //wait until data is displayed
    await waitForDataToBeDisplayed(page);

    // filter samples
    await applyFilter(page, filterBy);
    await page.screenshot({ path: "samplesPage.png", fullPage: true });

    // verify only complete samples are listed
    const sampleLineages = page.locator(".ez2j8c413");
    expect(await sampleLineages.count()).toBe(2); //we earlier prepared 2 samples with complete status
    for (let i = 0; i < (await sampleLineages.count()); i++) {
      expect(sampleLineages.nth(i)).toHaveText(filterBy.lineage);
    }
  });

  test("Should filter by collection date from", async ({ page }) => {
    const filterBy = {
      collectionDateFrom: collectionDateFrom, //changes are required
    };
    // filter samples
    await applyFilter(page, filterBy);

    // verify only samples meeting date criteria are listed
    const filterCollectionDate = new Date(filterBy.collectionDateFrom);

    const sampleCollectionDates = await page.locator(getByTestID(row));
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
    await applyFilter(page, filterBy);

    // verify only samples meeting date criteria are listed
    const filterCollectionDate = new Date(filterBy.collectionDateTo);

    const sampDates = await page.locator(getByTestID(row));
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
    await applyFilter(page, filterBy);

    // convert to date objects for comparison
    const filterCollectionDateFrom = new Date(filterBy.collectionDateFrom);
    const filterCollectionDateTo = new Date(filterBy.collectionDateTo);

    // verify only samples meeting date criteria are listed
    const collections = await page.locator(getByTestID(row));
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
    for (const period of periods) {
      const periodValue = uploadDatePeriods[period];
      // filter by collection date period
      await applyFilter(page, { collectionDatePeriod: period });

      //convert period to date object
      const filterCollectionDate = convertDaysToDate(periodValue);

      //verify only samples meeting criteria are listed
      const sampleCol = await page.locator(getByTestID(row));
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
    await applyFilter(page, filterBy);

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
    await applyFilter(page, filterBy);

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
    await applyFilter(page, filterBy);

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
      await applyFilter(page, { collectionDatePeriod: period });

      //convert period to date object
      const filterUploadDate = await convertDaysToDate(periodValue);

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
    await applyFilter(page, filterBy);

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

/**
 * This local function prepares sample response data for testing various filter criteria.
 * We are preparing the data on the fly because collection and sequencing dates are moving objects and we don't
 * want to update test data every day.
 */
function prepareTestData() {
  let mockResponseData = [];
  const totalSamplePerScenario = 2;
  //let defaults = getDefaults();
  // data for testing status = failed
  for (let i = 1; i <= totalSamplePerScenario; i++) {
    // get default values and set the statue to failed
    let defaults = getDefaults();
    defaults.czb_failed_genome_recovery = true;
    mockResponseData.push(getSampleResponseData(defaults));
  }

  // data for testing lineage
  for (let i = 1; i <= totalSamplePerScenario; i++) {
    // get default values and set the statue to failed
    let defaults = getDefaults();
    defaults.lineage = "BA.1.15";
    mockResponseData.push(getSampleResponseData(defaults));
  }

  // data for samples collected within last 7 days
  for (let i = 1; i <= totalSamplePerScenario; i++) {
    // get default values and set the statue to failed
    let defaults = getDefaults();
    defaults.collection_date = getADateInThePast(0, 7);
    mockResponseData.push(getSampleResponseData(defaults));
  }

  // data for samples collected within last 30 days; we already have 2 within 7 days
  let defaults = getDefaults();
  defaults.collection_date = getADateInThePast(8, 30);
  mockResponseData.push(getSampleResponseData(defaults));

  // data for samples collected within last 3 months; we already have 3 within 30 days
  defaults = getDefaults();
  defaults.collection_date = getADateInThePast(31, 90);
  mockResponseData.push(getSampleResponseData(defaults));

  // data for samples collected within last 6 months; we already have 4 within 3 months
  defaults = getDefaults();
  defaults.collection_date = getADateInThePast(91, 120);
  mockResponseData.push(getSampleResponseData(defaults));

  // data for samples collected within last 1 year; we already have 5 within 6 months
  defaults = getDefaults();
  defaults.collection_date = getADateInThePast(121, 360);
  mockResponseData.push(getSampleResponseData(defaults));

  // data for samples uploaded today
  for (let i = 1; i <= totalSamplePerScenario; i++) {
    // get default values and set the statue to failed
    let defaults = getDefaults();
    defaults.upload_date = getADateInThePast(0, 0);
    mockResponseData.push(getSampleResponseData(defaults));
  }
  // data for samples uploaded yesterday, we have 2 uploaded today
  for (let i = 1; i <= totalSamplePerScenario; i++) {
    // get default values and set the statue to failed
    let defaults = getDefaults();
    defaults.upload_date = getADateInThePast(1, 1);
    mockResponseData.push(getSampleResponseData(defaults));
  }
  // data for samples uploaded with last 7 days; we already have 4 uploaded today and yesterday
  defaults = getDefaults();
  defaults.upload_date = getADateInThePast(2, 7);
  mockResponseData.push(getSampleResponseData(defaults));
  return mockResponseData;
}
/**
 * Default values to be used for generating a samples;
 * This helps us know exactly which records meets our filtering criteria
 * Please note collection and sequening dates are set deliberately set to over a year and specifically overwritten for given scenario
 */
function getDefaults(): Partial<SampleResponseDefaults> {
  return {
    collection_date: "2021-05-05",
    collection_location: 2605082,
    czb_failed_genome_recovery: false,
    gisaid_id: null,
    gisaid_status: "Not Found",
    lineage: "QA.1.15",
    private: false,
    upload_date: "2021-05-05",
  };
}

async function waitForDataToBeDisplayed(page: Page) {
  //accept cookie t&c
  //await page.locator('text="Accept"').first().click();
  await page
    .locator('[aria-label="Help us improve CZ GEN EPI"] >> text=Accept')
    .click();

  //wait until data is displayed
  await page.waitForSelector('[data-test-id="table-row"]');

  // assert table is populated with at least one record
  expect(
    await page.locator('[data-test-id="table-row"]').count()
  ).toBeGreaterThan(0);
}
