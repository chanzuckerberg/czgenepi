import { faker } from "@faker-js/faker";
import ApiUtil from "./api";
const fs = require("fs");
const { request, expect } = require("@playwright/test");

const defaultSequence =
  "ATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTC";
const locationId = 166768;

const cookieStorage = "e2e/storage/cookies.json";
export default abstract class SampleUtil {
  /*
This method generates sample data that can be used for uploading
@param {number} total: total samples to generate, defaults to 1
@param {string} sequence: genome sequence; defaults to a const
@param {string} collection_date: sample collection date, defaults to a date within the past 10 days
@param {number} location_id: location where sample was taken, defaults to a const
@param {boolean} privateSample: if sample is private or not, default is false
@param {string} private_identifier: private id, defaults to randomly generated using faker-js
@params {string} public_identifier: public id, defaults to randomly generated using faker-js 
*/
  public static generateSampleData(
    total: number = 1,
    sequence?: string,
    sequencing_date?: string,
    collection_date?: string,
    location_id?: number,
    privateSample?: boolean,
    private_identifier?: string,
    public_identifier?: string
  ): Array<SampleData> {
    const collectionDate =
      collection_date !== undefined
        ? collection_date
        : SampleUtil.getPastDate(10);

    let results = [];

    for (let i = 1; i <= total; i++) {
      results.push({
        pathogen_genome: {
          sequence: sequence !== undefined ? sequence : defaultSequence,
          sequencing_date:
            sequencing_date !== undefined
              ? sequencing_date
              : SampleUtil.getPastDate(10, collectionDate),
        },
        sample: {
          collection_date: collectionDate,
          location_id: location_id !== undefined ? location_id : locationId,
          private: privateSample !== undefined ? privateSample : false,
          private_identifier:
            private_identifier !== undefined
              ? private_identifier
              : SampleUtil.generateSampleId(),
          public_identifier:
            public_identifier !== undefined
              ? public_identifier
              : SampleUtil.generateSampleId(),
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
  public static generateSampleId(country?: string, privateId?: boolean) {
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
      const _country = country !== undefined ? country : faker.address.country;
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
  */
  public static async uploadSample(data: SampleData) {
    let url = `/v2/users/me`;
    await ApiUtil.getRequest(url).then((response) => {
      const group = response.group;
      url = `/v2/orgs/${group.id}/samples/`;
      ApiUtil.postRequest(url, data).then((response) => {
        expect(response.samples).toBeGreaterThan(0);
        return response.samples;
      });
    });
  }

  /*
  Method for getting samples.
  */
  public static async getSamples(): Promise<any> {
    const groupId = process.env.GROUPID ?? "";
    const endpoint = `v2/orgs/${groupId}/samples/`;

    const context = await request.newContext({
      baseURL: process.env.BASEAPI,
    });
    await context
      .get(endpoint, {
        headers: SampleUtil.setHeaders(),
      })
      .then((response: { ok: () => any; json: () => any }) => {
        console.log("****** been here **********");
        console.log(response);
        expect(response.ok()).toBeTruthy();
        return response.json();
      });
  }

  /*
    Helper function for HTTP request headers. It reads cookie from file and attaches to the header
    @return {object} return header object
    */
  public static setHeaders() {
    const cookies = `OptanonAlertBoxClosed=2022-08-19T09:28:00.361Z;
      ajs_anonymous_id=c2718103-b052-4c40-a5c5-74442fd24165;
      ajs_user_id=llhznbdsa6q7jr0hnhtg;
      OptanonConsent=isIABGlobal=false&datestamp=Thu+Aug+25+2022+11%3A19%3A45+GMT%2B0100+(British+Summer+Time)
      &version=6.34.0
      &hosts=
      &landingPath=NotLandingPage
      &groups=C0001%3A1%2CC0002%3A1
      &geolocation=GB%3BENG
      &AwaitingReconsent=false;
      session=${process.env.COOKIES}`;
    return {
      accept: "application/json",
      cookie: cookies.replace(/\r?\n|\r/g, ""),
    };
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
