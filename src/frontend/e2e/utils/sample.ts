import * as faker from "@faker-js/faker";
import { Route } from "next/dist/server/router";
import { BrowserContext, Page } from "playwright";
const { request, expect, context } = require("@playwright/test");
const fs = require("fs");

const defaultSequence =
  "ATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTC";
const locationId = 166768;
const storageStateFile = "e2e/storage/state.json";

const storageState = fs.readFileSync(storageStateFile);
export class SampleUtil {
  /*
This method generates sample data that can be used for uploading
@param {number} total: total samples to generate, defaults to 1
*/
  public static generateRandomSampleData(total: number = 1): Array<SampleData> {
    const pastDays = 10;
    const collectionDate = SampleUtil.getADateInThePast(pastDays);
    let results = [];

    for (let i = 1; i <= total; i++) {
      results.push({
        pathogen_genome: {
          sequence: defaultSequence,
          sequencing_date: SampleUtil.getADateInThePast(
            pastDays,
            collectionDate
          ),
        },
        sample: {
          collection_date: SampleUtil.getADateInThePast(pastDays),
          location_id: locationId,
          private: false,
          private_identifier: SampleUtil.generateSampleId(),
          public_identifier: SampleUtil.generateSampleId(),
        },
      });
    }
    return results;
  }

  /*
  This is a helper method for generating sample id; both private and public. For public ID
  we use the prefix hCoV-19, whereas for private we generate random string as prefix.
  @param {string} country: country where sample was taken, defaults to randomly generated
  @param {boolean} privateSample: we use this to determine we should include "hCoV-19" as prefix or generate random ID
  */
  public static generateSampleId(
    country?: string,
    privateId: boolean = false
  ): string {
    if (privateId) {
      const charSet =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
      let randomString = "";
      for (let i = 0; i <= 20; i++) {
        let randomPos = Math.floor(Math.random() * charSet.length);
        randomString += charSet.substring(randomPos, randomPos + 1);
      }
      return randomString;
    } else {
      const prefix = "hCoV-19";
      const _country =
        country !== undefined ? country : faker.address.country();
      const _number = faker.datatype.number({
        min: 10000,
        max: 99999,
      });
      const year = new Date().getFullYear();

      return `${prefix}/${_country}/QA-${_number}/${year}`;
    }
  }

  /*
  Sample collection and sequencing dates need to be in the past. 
  This helper method generates a date in the past it does not need to be hard coded. 
  @param {number} howRecent: how recent the date should be, defaults to 10, meaning the date can be 1 - 10 days in the past
  @param {string} refDate: reference date to use, especially useful for sequencing date that needs to be older that collection date
  */
  public static getADateInThePast(
    howRecent?: number,
    refDate?: string
  ): string {
    const days =
      howRecent !== undefined
        ? howRecent
        : faker.datatype.number({
            min: 1,
            max: 10,
          });
    if (refDate !== undefined) {
      return faker.date.recent(days, refDate).toISOString().substring(0, 10);
    } else {
      return faker.date.recent(days).toISOString().substring(0, 10);
    }
  }

  /*
  Method for posting sample upload data. This method will first make a GET request
  to obtain the group of the user, which is needed to construct the URL.
  @param { object } - payload with array of sample data;
  */
  public static async uploadSample(payload: Array<SampleData>) {
    const groupId = process.env.GROUPID;
    const endpoint = `/v2/orgs/74/samples/`;
    console.log(process.env.BASEAPI);
    const context = await request.newContext({
      baseURL: "https://api.staging.czgenepi.org",
    });
    const response = await context.post(endpoint, {
      headers: SampleUtil.setHeaders(),
      data: payload,
    });
    expect(response.ok()).toBeTruthy();
    return response.json();
  }

  /*
  Method for getting samples. reads users group ID from process.env
  where it was saved when user first logged in. 
  @returns - project of the body json.
  */
  public static async getSamples(context: BrowserContext) {
    const url = `${process.env.BASEAPI}/v2/orgs/${process.env.GROUPID}/pathogens/SC2/samples/`;
    // await page.evaluate(async (url) => {
    //   return await fetch(url, { method: "GET" })
    //     .then(r => r.ok ? r.json() : Promise.reject(r))
    // }, url)
    console.log("******************");
    await context.route(url, async (route) => {
      console.log("******************");
      const response = await context.request.fetch(route.request());
      expect(response.ok()).toBeTruthy();
      console.log(response);
      console.log("******************");
      return response.json();
    });
  }

  async getUserDetails(page: Page) {
    const endpoint = `/v2/users/me`;
    await page.evaluate(async () => {
      return await fetch(`${process.env.BASEAPI}${endpoint}`, {
        method: "GET",
      }).then((r) => (r.ok ? r.json() : Promise.reject(r)));
    });
  }

  async mockGetSampleApi(
    page: Page,
    mockData: Array<SampleData>,
    groupId: number = 74
  ) {
    const url = `${process.env.BASEAPI}/v2/orgs/${groupId}/pathogens/SC2/samples/`;
    await page.route(url, (route) =>
      route.fulfill({
        contentType: "application/json",
        body: JSON.stringify(mockData),
      })
    );
    await page.goto(
      `${process.env.BASEURL}/data/samples/${groupId}/74/pathogen/covid`
    );
  }
}

export interface SampleData {
  pathogen_genome: {
    sequence: string;
    sequencing_date: string;
  };
  sample: {
    collection_date: string;
    location_id: number;
    private: boolean;
    private_identifier: string;
    public_identifier: string;
  };
}

export interface Group {
  id: number;
  name: string;
}
