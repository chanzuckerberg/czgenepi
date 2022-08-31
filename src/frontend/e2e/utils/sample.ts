import { faker } from "@faker-js/faker";
const { request, expect } = require("@playwright/test");
const fs = require("fs");

const defaultSequence =
  "ATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTC";
const locationId = 166768;
const storageStateFile = "e2e/storage/state.json";

const storageState = fs.readFileSync(storageStateFile);
export default abstract class SampleUtil {
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
  public static async getSamples(): Promise<any> {
    const groupId = process.env.GROUPID;
    const endpoint = `/v2/orgs/74/samples/`;
    //console.log(storageState)
    const context = await request.newContext({
      baseURL: "https://api.staging.czgenepi.org",
      storageState: storageStateFile,
    });
    const response = await context.get(endpoint, {
      //headers: SampleUtil.setHeaders(),
    });
    //expect(response.ok()).toBeTruthy();
    console.log(response);
    return response.json();
  }

  /*
    Helper function for HTTP request headers. It reads cookie from file and attaches to the header
    @return {object} return header object
  */
  public static setHeaders() {
    let cookies = "OptanonAlertBoxClosed=2022-08-19T09:28:00.361Z; ";
    cookies += "ajs_user_id=0g4u6x3nhde5p8m8wmad; ";
    cookies += "ajs_anonymous_id=16229f03-caaf-4803-8d16-e39168c89339; ";
    cookies += "OptanonConsent=isIABGlobal=false";
    cookies +=
      "&datestamp=Fri+Aug+29+2022+16%3A38%3A43+GMT%2B0100+(British+Summer+Time)";
    cookies += "&version=6.34.0";
    cookies += "&hosts=&landingPath=NotLandingPage";
    cookies += "&groups=C0001%3A1%2CC0002%3A1";
    cookies += "&geolocation=GB%3BENG";
    cookies += "&AwaitingReconsent=false; ";
    cookies += `session=.eJx9kG9LwzAQxr9LYH2zua6trWuhiEqrMsShTtnelCw5u3RpUpPsjxv77maFwV6okOPgntzd7549KrTBBgq8MotB4T3WH5mE7WY8_RpVVRAsF5PsCh7uBuw5MyjZI4oNPmYhBQGUIDzLR3Rq3ptKh5M3fa85F6iHFFCmgJhipZj9tTCm0Ynr4ob17b6SibJPdiUIsAWpSnftu0cCl2DO55gs7YiV4medRK4ZNcpKoC5OI1roPpF12ywV28G1At1IoaEw3w2kRFJwCGcgTMFoOn0c3e4osE35Kp9mw2EuvTwKszn1opcqrMfOOXfa7u4ENx0_t-8vdiut_aNuEWw6XeBoIi2ADcFot1Hyk3HoQo0Zd1rL0__NdlqH01_9PfQQbBuUeFHkxaEf-F7fu4yDOB4eDj9MQ6JR.Yw9TNA.RDYpTy8es0ScAMxz3n3cpcS6Cr8`;
    console.log(cookies);
    return {
      accept: "*/*",
      cookie: cookies,
    };
  }

  public static getGroupId() {
    if (process.env.GROUPID === undefined) return process.env.GROUPID;
    SampleUtil.getUserDetails().then((data) => {
      return data.group.id;
    });
  }

  public static async getUserDetails() {
    const endpoint = `/v2/users/me`;
    const context = await request.newContext({
      baseURL: process.env.BASEAPI,
    });
    const response = await context.get(endpoint, {
      headers: SampleUtil.setHeaders(),
    });
    expect(response.ok()).toBeTruthy();
    return response.json();
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
