import { expect, test, Page, BrowserContext } from "@playwright/test";
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
  //"Today": 0, //bug raised: SC-216585
  Yesterday: 1,
  "Last 7 Days": 7,
};
const collectionDatePeriods: { [key: string]: number } = {
  "Last 3 Months": 90,
  "Last 30 Days": 30,
  "Last 6 Months": 180,
  "Last 7 Days": 7,
  "Last Year": 365,
};

const fromDate = getADateInThePast(0, 5);
const toDate = getADateInThePast(0, 1);
const collectionDateSelector = "row-collectionDate";
const uploadDateSelector =
  "//div[@data-test-id='table-row']/descendant::div[13]"; //todo: add data-test-id

const api = `${process.env.BASEAPI}/v2/orgs/${process.env.GROUPID}/pathogens/SC2/samples/`;
let url = "";
const mockData = {
  samples: prepareTestData(),
};
test.describe("Sample filtering tests", () => {
  test.beforeEach(async ({ page, context }, workerInfo) => {
    const baseUrl = workerInfo.config.projects[0].use.baseURL;
    url = `${baseUrl}/data/samples`;
    await page.goto(url);
    //accept cookie t&c
    await page
      .locator('[aria-label="Help us improve CZ GEN EPI"] >> text=Accept')
      .click();

    //intercept request and stub response
    await interceptRequestAndStubResponse(page, context);
  });

  test.only("Should filter samples by status", async ({ page }) => {
    // filter for complete status
    let filterBy = {
      status: "Complete",
    };
    // filter samples
    await applyFilter(page, filterBy);

    // verify only complete samples are listed
    const samplesWithCompleteStatus = 11;
    let sampleStatuses = page.locator(getByTestID("sample-status"));
    expect(await sampleStatuses.count()).toBe(samplesWithCompleteStatus);
    for (let i = 0; i < (await sampleStatuses.count()); i++) {
      expect(sampleStatuses.nth(i)).toHaveText(
        filterBy.status.toLocaleLowerCase()
      );
    }

    // filter for complete status
    filterBy = {
      status: "Failed",
    };
    // filter samples
    await applyFilter(page, filterBy);

    // verify only failed samples are listed
    const samplesWithFailedStatus = 2;
    sampleStatuses = page.locator(getByTestID("sample-status"));
    expect(await sampleStatuses.count()).toBe(samplesWithFailedStatus);
    for (let i = 0; i < (await sampleStatuses.count()); i++) {
      expect(sampleStatuses.nth(i)).toHaveText(
        filterBy.status.toLocaleLowerCase()
      );
    }
  });

  test.only("Should filter samples by lineage", async ({ page }) => {
    // define filtering criteria
    const filterBy = {
      lineage: ["BA.1.15"],
    };

    // filter samples
    await applyFilter(page, filterBy);

    // verify only complete samples are listed
    const sampleLineages = page.locator(".ez2j8c413");
    expect(await sampleLineages.count()).toBe(2); //we earlier prepared 2 samples with complete status
    for (let i = 0; i < (await sampleLineages.count()); i++) {
      expect(sampleLineages.nth(i)).toHaveText(filterBy.lineage);
    }
  });

  test.only("Should filter by collection date from", async ({ page }) => {
    const filterBy = {
      collectionDateFrom: fromDate,
    };

    // filter samples
    await applyFilter(page, filterBy);

    // verify only samples meeting date criteria are listed
    const filterCollectionDate = new Date(filterBy.collectionDateFrom);
    const sampleCollectionDates = page.locator(
      getByTestID(collectionDateSelector)
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

  test.only("Should filter by collection date to", async ({ page }) => {
    const filterBy = {
      collectionDateTo: toDate,
    };
    // filter samples
    await applyFilter(page, filterBy);

    // verify only samples meeting date criteria are listed
    const filterCollectionDate = new Date(filterBy.collectionDateTo);

    const sampDates = await page.locator(getByTestID(collectionDateSelector));
    for (let i = 0; i < (await sampDates.count()); i++) {
      const actuallCollectionDate = new Date(
        (await sampDates.nth(i).textContent()) as string
      );
      const result =
        actuallCollectionDate <= filterCollectionDate ? true : false;
      expect(result).toBeTruthy();
    }
  });

  test.only("Should filter by collection date from and to", async ({
    page,
  }) => {
    const filterBy = {
      collectionDateFrom: fromDate,
      collectionDateTo: toDate,
    };
    // filter samples
    await applyFilter(page, filterBy);

    // convert to date objects for comparison
    const filterCollectionDateFrom = new Date(filterBy.collectionDateFrom);
    const filterCollectionDateTo = new Date(filterBy.collectionDateTo);

    // verify only samples meeting date criteria are listed
    const collections = await page.locator(getByTestID(collectionDateSelector));
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

  test.only("Should filter by collection date periods", async ({ page }) => {
    //test all date options

    const periods = Object.keys(collectionDatePeriods);
    for (const period of periods) {
      const periodValue = uploadDatePeriods[period];
      // filter by collection date period
      await applyFilter(page, { collectionDatePeriod: period });

      //convert period to date object
      const filterCollectionDate = convertDaysToDate(periodValue);

      //verify only samples meeting criteria are listed
      const sampleCol = page.locator(getByTestID(collectionDateSelector));
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

  test.only("Should filter by upload date from", async ({ page }) => {
    const filterBy = {
      uploadDateFrom: fromDate,
    };
    // filter samples by upload date from
    await applyFilter(page, filterBy);

    // verify only samples meeting date criteria are listed
    const filterUploadDate = new Date(filterBy.uploadDateFrom);

    const dates = page.locator(uploadDateSelector);
    for (let i = 0; i < (await dates.count()); i++) {
      const actuallUploadDate = new Date(
        (await dates.nth(i).textContent()) as string
      );
      const result = actuallUploadDate >= filterUploadDate ? true : false;
      expect(result).toBeTruthy();
    }
  });

  test.only("Should filter by upload date to", async ({ page }) => {
    const filterBy = {
      uploadDateTo: toDate,
    };
    // filter samples
    await applyFilter(page, filterBy);

    // verify only samples meeting date criteria are listed
    const filterUploadDate = new Date(filterBy.uploadDateTo);

    const sampleUploadDates = page.locator(uploadDateSelector);

    for (let i = 0; i < (await sampleUploadDates.count()); i++) {
      const actuallUploadDate = new Date(
        (await sampleUploadDates.nth(i).textContent()) as string
      );
      const result = actuallUploadDate <= filterUploadDate ? true : false;
      expect(result).toBeTruthy();
    }
  });

  test.only("Should filter by from and to upload dates", async ({ page }) => {
    const filterBy = {
      uploadDateFrom: fromDate,
      uploadDateTo: toDate,
    };
    // filter samples
    await applyFilter(page, filterBy);

    // verify only samples meeting date criteria are listed
    const filterFromDate = new Date(filterBy.uploadDateFrom);
    const filterToDate = new Date(filterBy.uploadDateTo);

    const sampleUploadDates = page.locator(uploadDateSelector);
    for (let i = 0; i < (await sampleUploadDates.count()); i++) {
      const actuallUploadDate = new Date(
        (await sampleUploadDates.nth(i).textContent()) as string
      );
      const dateFromResult = actuallUploadDate >= filterFromDate ? true : false;
      const dateToResult = actuallUploadDate <= filterToDate ? true : false;
      expect(dateFromResult).toBeTruthy();
      expect(dateToResult).toBeTruthy();
    }
  });

  test.only("Should filter by upload date periods", async ({ page }) => {
    //test all date options
    const periods = Object.keys(uploadDatePeriods);
    for (const period of periods) {
      // filter
      const periodValue = uploadDatePeriods[period];
      await applyFilter(page, { uploadDatePeriod: period });

      //convert period to date object
      const filterUploadDate = convertDaysToDate(periodValue);

      //verify sample listing
      const sampleUploadDates = page.locator(uploadDateSelector);
      for (let i = 0; i < (await sampleUploadDates.count()); i++) {
        const actualUploadDate = new Date(
          (await sampleUploadDates.nth(i).textContent()) as string
        );
        const result = actualUploadDate >= filterUploadDate ? true : false;
        expect(result).toBeTruthy();
      }
    }
  });

  test.only("Should filter by multiple fields", async ({ page }) => {
    //todo: change filter values
    const filterBy = {
      collectionDateFrom: fromDate,
      collectionDateTo: toDate,
      lineage: ["BA.1.15"],
      status: "Complete",
      uploadDateFrom: fromDate,
      uploadDateTo: toDate,
    };
    // filter
    await applyFilter(page, filterBy);

    //verify sample listing
    const samples = await page.locator(getByTestID("table-row"));
    for (let i = 0; i < (await samples.count()); i++) {
      //verify upload date is within from-to range
      const uploadDateText = (await page
        .locator(uploadDateSelector)
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
        .locator(getByTestID(collectionDateSelector))
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
 * Default values to be used for generating a sample response data;
 * This helps us know exactly which records meet our filtering criteria
 * Please note that collection and sequencing dates are set deliberately set to over a year
 * and should be specifically overwritten for given scenarios
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

async function interceptRequestAndStubResponse(
  page: Page,
  context: BrowserContext
) {
  //create an intercept to stub response with mock data once we get response with status 200
  await context.route(
    api,
    async (route: {
      fulfill: (arg0: { response: any; body: string }) => void;
    }) => {
      const response = await context.request.get(api);
      //check we get response 200, but we could also abort the call (route.abort() : route.continue();)
      expect(response.ok()).toBeTruthy();
      //retain original response but replace body part with stubbed data we created
      route.fulfill({
        response,
        body: JSON.stringify(mockData),
      });
    }
  );
  // make the actual call, wait until all responses have been received
  await page.goto(url, { waitUntil: "networkidle" });

  //wait until data is displayed
  await page.waitForSelector(getByTestID("table-row"));

  // assert table is populated with at least one record
  expect(await page.locator(getByTestID("table-row")).count()).toBeGreaterThan(
    0
  );
}
