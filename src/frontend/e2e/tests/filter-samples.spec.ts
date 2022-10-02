import { expect, test, Page, BrowserContext } from "@playwright/test";
import { getSampleResponseData, SampleResponseDefaults } from "../utils/sample";
import { applyFilter } from "../pages/filter";
import path from "path";
import * as dotenv from "dotenv";
import { getByTestID } from "../utils/selectors";
import { getADateInThePast } from "../utils/common";
import { BasePage } from "../pages/basePage";

dotenv.config({
  path: path.resolve(__dirname, "../../", `.env.${process.env.NODE_ENV}`),
});

const uploadDatePeriods: { [key: string]: number } = {
  Today: 0, //bug raised: SC-216585
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

const sampleStatusId = "sample-status";
const fromDate = getADateInThePast(0, 5);
const toDate = getADateInThePast(0, 1);
const fromDateInt = dateToInteger(fromDate);
const toDateInt = dateToInteger(toDate);

const collectionDateSelector = "row-collectionDate";
const uploadDateSelector =
  "//div[@data-test-id='table-row']/descendant::div[13]";

const api = `${process.env.BASEAPI}/v2/orgs/${process.env.GROUPID}/pathogens/SC2/samples/`;
let url = "";
const mockData = {
  samples: prepareTestData(),
};
test.describe("Sample filtering tests", () => {
  test.beforeEach(async ({ page, context }, workerInfo) => {
    const baseUrl = workerInfo.config.projects[0].use.baseURL;
    url = `${baseUrl}/data/samples/groupId/${process.env.GROUPID}/pathogen/SC2`;
    await page.goto(url);
    //accept cookie t&c (if prompted)
    const acceptCookieSelector =
      '[aria-label="Help us improve CZ GEN EPI"] >> text=Accept';
    if (await page.isVisible(acceptCookieSelector)) {
      await page.locator(acceptCookieSelector).click();
    }
    //intercept request and stub response
    await interceptRequestAndStubResponse(page, context);
  });

  // This test currently fails and needs fixing; it is not clear why the element is not found
  test.skip("Should filter samples by status", async ({ page }) => {
    const base = new BasePage(page);
    // filter for complete status
    let filterBy = {
      status: "Complete",
    };
    // filter samples
    await applyFilter(base, filterBy);

    // verify only complete samples are listed
    let sampleStatuses = await base.findByTestId(sampleStatusId);
    for (let i = 0; i < (await sampleStatuses.count()); i++) {
      expect(sampleStatuses.nth(i)).toHaveText(filterBy.status.toLowerCase());
    }

    // filter for complete status
    filterBy = {
      status: "Failed",
    };
    // filter samples
    await applyFilter(base, filterBy);

    // verify only failed samples are listed
    sampleStatuses = sampleStatuses = await base.findByTestId(sampleStatusId);
    for (let i = 0; i < (await sampleStatuses.count()); i++) {
      expect(sampleStatuses.nth(i)).toHaveText(filterBy.status.toLowerCase());
    }
  });

  test("Should filter samples by lineage", async ({ page }) => {
    const base = new BasePage(page);
    // define filtering criteria
    const filterBy = {
      lineage: ["BA.1.15"],
    };

    // filter samples
    await applyFilter(base, filterBy);

    // verify only complete samples are listed
    const sampleLineages = await base.findElement(".ez2j8c413");
    for (let i = 0; i < (await sampleLineages.count()); i++) {
      expect(sampleLineages.nth(i)).toHaveText(filterBy.lineage);
    }
  });

  test("Should filter by collection date from", async ({ page }) => {
    const base = new BasePage(page);
    const filterBy = {
      collectionDateFrom: fromDate,
    };

    // filter samples
    await applyFilter(base, filterBy);

    // verify only samples meeting date criteria are listed
    const rowCollectionDates = await base.findByTestId(collectionDateSelector);
    for (let i = 0; i < (await rowCollectionDates.count()); i++) {
      const collectionDate = await dateToInteger(
        (await rowCollectionDates.nth(i).textContent()) as string
      );
      expect(collectionDate).toBeGreaterThanOrEqual(await fromDateInt);
    }
  });

  test("Should filter by collection date to", async ({ page }) => {
    const base = new BasePage(page);
    const filterBy = {
      collectionDateTo: toDate,
    };
    // filter samples
    await applyFilter(base, filterBy);

    // verify only samples meeting date criteria are listed
    const rowCollectionDates = await base.findByTestId(collectionDateSelector);
    for (let i = 0; i < (await rowCollectionDates.count()); i++) {
      const collectionDate = await dateToInteger(
        (await rowCollectionDates.nth(i).textContent()) as string
      );
      expect(collectionDate).toBeLessThanOrEqual(await toDateInt);
    }
  });

  test("Should filter by collection date from and to", async ({ page }) => {
    const base = new BasePage(page);
    const filterBy = {
      collectionDateFrom: fromDate,
      collectionDateTo: toDate,
    };
    // filter samples
    await applyFilter(base, filterBy);

    // verify only samples meeting date criteria are listed
    const rowCollectionDates = await base.findByTestId(collectionDateSelector);
    for (let i = 0; i < (await rowCollectionDates.count()); i++) {
      const collectionDate = await dateToInteger(
        (await rowCollectionDates.nth(i).textContent()) as string
      );

      expect(collectionDate).toBeGreaterThanOrEqual(await fromDateInt);
      expect(collectionDate).toBeLessThanOrEqual(await toDateInt);
    }
  });

  //todo: defect sc-216597
  test.skip("Should filter by collection date periods", async ({ page }) => {
    const base = new BasePage(page);
    //test all date options
    const periods = Object.keys(collectionDatePeriods);
    for (const period of periods) {
      // filter by collection date period
      await applyFilter(base, { collectionDatePeriod: period });

      //convert period to date int
      const filterDate = dateOptionToNumber(period);

      //verify only samples meeting criteria are listed
      const rowCollectionDates = await base.findByTestId(
        collectionDateSelector
      );
      for (let i = 0; i < (await rowCollectionDates.count()); i++) {
        const collectionDate = await dateToInteger(
          (await rowCollectionDates.nth(i).textContent()) as string
        );
        expect(collectionDate).toBeLessThanOrEqual(filterDate);
      }
    }
  });

  // fails in CI, there is also a defect. will skip until sorted
  test.skip("Should filter by upload date from", async ({ page }) => {
    const base = new BasePage(page);
    const filterBy = {
      uploadDateFrom: fromDate,
    };
    // filter samples by upload date from
    await applyFilter(base, filterBy);

    // verify only samples meeting date criteria are listed
    const rowUploadDates = await base.findElement(uploadDateSelector);
    for (let i = 0; i < (await rowUploadDates.count()); i++) {
      const uploadDate = await dateToInteger(
        (await rowUploadDates.nth(i).textContent()) as string
      );
      expect(uploadDate).toBeGreaterThanOrEqual(await fromDateInt);
    }
  });

  test("Should filter by upload date to", async ({ page }) => {
    const base = new BasePage(page);
    const filterBy = {
      uploadDateTo: toDate,
    };
    // filter samples
    await applyFilter(base, filterBy);

    // verify only samples meeting date criteria are listed
    const rowUploadDates = await base.findElement(uploadDateSelector);

    for (let i = 0; i < (await rowUploadDates.count()); i++) {
      const uploadDate = await dateToInteger(
        (await rowUploadDates.nth(i).textContent()) as string
      );
      expect(uploadDate).toBeLessThanOrEqual(await toDateInt);
    }
  });

  // fails in CI, there is also a defect. will skip until sorted
  test.skip("Should filter by from and to upload dates", async ({ page }) => {
    const base = new BasePage(page);
    const filterBy = {
      uploadDateFrom: fromDate,
      uploadDateTo: toDate,
    };
    // filter samples
    await applyFilter(base, filterBy);

    // verify only samples meeting date criteria are listed
    const rowUploadDates = await base.findByTestId(uploadDateSelector);
    for (let i = 0; i < (await rowUploadDates.count()); i++) {
      const uploadDate = await dateToInteger(
        (await rowUploadDates.nth(i).textContent()) as string
      );

      expect(uploadDate).toBeGreaterThanOrEqual(await fromDateInt);
      expect(uploadDate).toBeLessThanOrEqual(await toDateInt);
    }
  });

  test("Should filter by upload date periods", async ({ page }) => {
    const base = new BasePage(page);
    //test all date options
    const periods = Object.keys(uploadDatePeriods);
    for (const period of periods) {
      // filter
      await applyFilter(base, { uploadDatePeriod: period });

      //convert period to date object
      const filterDate = dateOptionToNumber(period);

      //verify sample listing
      const rowUploadDates = await base.findElement(uploadDateSelector);
      for (let i = 0; i < (await rowUploadDates.count()); i++) {
        const uploadDate = await dateToInteger(
          (await rowUploadDates.nth(i).textContent()) as string
        );
        expect(uploadDate).toBeGreaterThanOrEqual(filterDate);
      }
    }
  });

  test("Should filter by multiple fields", async ({ page }) => {
    const base = new BasePage(page);
    const filterBy = {
      collectionDateFrom: fromDate,
      collectionDateTo: toDate,
      lineage: ["BA.1.15"],
      status: "Complete",
      uploadDateFrom: fromDate,
      uploadDateTo: toDate,
    };
    // filter
    await applyFilter(base, filterBy);

    //verify sample listing
    const sampleRows = await base.findByTestId("table-row");
    for (let i = 0; i < (await sampleRows.count()); i++) {
      //verify upload date is within from-to range
      const uploadDate = await dateToInteger(
        (await (await base.findElement(uploadDateSelector))
          .nth(i)
          .textContent()) as string
      );

      expect(uploadDate).toBeGreaterThanOrEqual(await fromDateInt);
      expect(uploadDate).toBeLessThanOrEqual(await toDateInt);

      //very collection date is within from-to range
      const collectionDate = await dateToInteger(
        (await (await base.findElement(collectionDateSelector))
          .nth(i)
          .textContent()) as string
      );

      expect(collectionDate).toBeGreaterThanOrEqual(await fromDateInt);
      expect(collectionDate).toBeLessThanOrEqual(await toDateInt);

      //verify lineage
      const val = await (await base.findElement(".ez2j8c413"))
        .nth(i)
        .textContent();
      expect(filterBy.lineage).toContain(val);
      //verify status
      await expect((await base.findByTestId(sampleStatusId)).nth(i)).toHaveText(
        filterBy.status
      );
    }
  });
});

/**
 * This local function prepares sample response data for testing various filter criteria.
 * We are preparing the data on the fly because collection and sequencing dates are moving objects and we don't
 * want to update test data every day.
 */
function prepareTestData() {
  const mockResponseData = [];
  const totalSamplePerScenario = 2;
  // data for testing status = failed
  for (let i = 1; i <= totalSamplePerScenario; i++) {
    // get default values and set the status to failed
    const defaults = getDefaults();
    defaults.czb_failed_genome_recovery = true;
    mockResponseData.push(getSampleResponseData(defaults));
  }

  // data for testing lineage
  for (let i = 1; i <= totalSamplePerScenario; i++) {
    // get default values and set the statue to failed
    const defaults = getDefaults();
    defaults.lineage = "BA.1.15";
    mockResponseData.push(getSampleResponseData(defaults));
  }

  // data for samples collected within last 7 days
  for (let i = 1; i <= totalSamplePerScenario; i++) {
    // get default values and set the statue to failed
    const defaults = getDefaults();
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

  // data for samples collected within last year; we already have 5 within 6 months
  defaults = getDefaults();
  defaults.collection_date = getADateInThePast(121, 360);
  mockResponseData.push(getSampleResponseData(defaults));

  // data for samples uploaded today
  for (let i = 1; i <= totalSamplePerScenario; i++) {
    // get default values and set the statue to failed
    const defaults = getDefaults();
    defaults.upload_date = getADateInThePast(0, 0);
    mockResponseData.push(getSampleResponseData(defaults));
  }
  // data for samples uploaded yesterday, we have 2 uploaded today
  for (let i = 1; i <= totalSamplePerScenario; i++) {
    // get default values and set the statue to failed
    const defaults = getDefaults();
    defaults.upload_date = getADateInThePast(0, 1);
    mockResponseData.push(getSampleResponseData(defaults));
  }
  // data for samples uploaded within last 7 days; we already have 4 uploaded today and yesterday
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
  // make the actual call, wait until all responses have been received
  await page.goto(url, { waitUntil: "networkidle" });

  //wait for UI to render
  await page.waitForSelector(`[data-test-id="row-publicId"]`);

  // assert table is populated with at least one record
  expect(await page.locator(getByTestID("table-row")).count()).toBeGreaterThan(
    0
  );
}
async function dateToInteger(dateString: string): Promise<number> {
  return Date.parse(dateString);
}

//convert day option into numberic based on current date
function dateOptionToNumber(period: string): number {
  const today = new Date();
  const filterDate = new Date(today);
  const value = Number(period.trim().replace(/\D/g, ""));
  if (period.includes("Yesterday")) {
    filterDate.setDate(filterDate.getDay() - 1);
  } else if (period.includes("Days")) {
    filterDate.setDate(filterDate.getDay() - value);
  } else if (period.includes("Months")) {
    filterDate.setMonth(filterDate.getMonth() - value);
  } else if (period.includes("Year")) {
    filterDate.setFullYear(filterDate.getFullYear() - 1);
  } else {
    return filterDate.getTime();
  }
  return filterDate.getTime();
}
