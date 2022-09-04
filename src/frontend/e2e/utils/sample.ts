import { faker } from "@faker-js/faker";
import { BrowserContext, Page } from "playwright";
const { expect } = require("@playwright/test");
require("dotenv").config();

const defaultSequence =
  "ATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTC";
const locationId = 166768;

export class SampleUtil {
  /*
This method generates sample data that can be used for uploading
@param {number} total: total samples to generate, defaults to 1
*/
  public static generateRandomSampleData(defaults?: SampleData): SampleData {
    const pastDays = 10;
    const collectionDate = SampleUtil.getADateInThePast(pastDays);
    return {
      pathogen_genome: {
        sequence: defaultSequence,
        sequencing_date: SampleUtil.getADateInThePast(pastDays, collectionDate),
      },
      sample: {
        collection_date: SampleUtil.getADateInThePast(pastDays),
        location_id: locationId,
        private: false,
        private_identifier: SampleUtil.generatePrivateSampleId(),
        public_identifier: SampleUtil.generatePublicSampleId(),
      },
    };
  }

  /*
  This is a helper method for generating public sample id. 
  We use the prefix hCoV-19
  @param {string} country: country where sample was taken, defaults to randomly generated
  */
  public static generatePublicSampleId(country?: string): string {
    const prefix = "hCoV-19";
    const _country = country !== undefined ? country : faker.address.country();
    const _number = faker.datatype.number({
      min: 10000,
      max: 99999,
    });
    const year = new Date().getFullYear();

    return `${prefix}/${_country}/QA-${_number}/${year}`;
  }

  public static generatePrivateSampleId(): string {
    const charSet =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let randomString = "";
    for (let i = 0; i <= 20; i++) {
      let randomPos = Math.floor(Math.random() * charSet.length);
      randomString += charSet.substring(randomPos, randomPos + 1);
    }
    return randomString;
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
  Method for getting samples. reads users group ID from process.env
  where it was saved when user first logged in. 
  @returns - project of the body json.
  */
  public static async mockGetSamplesApi(
    page: Page,
    context: BrowserContext,
    data: any
  ) {
    const url = `${process.env.BASEURL}/data/samples/${process.env.GROUPID}/pathogen/covid`;
    //console.log(url);
    await context.route(url, async (route) => {
      const response = await context.request.fetch(route.request());
      //expect(response.ok()).toBeTruthy();
      route.fulfill({
        response,
        body: JSON.parse(data),
      });
      console.log(await response);
    });
    //console.log(url);
    await page.goto(url);
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
