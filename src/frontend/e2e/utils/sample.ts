import { faker } from "@faker-js/faker";
import { sample } from "lodash";
require("dotenv").config();

const defaultSequence =
  "ATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTC";
const locationId = 166768;
const lineages = ["A", "BA.1.1", "BA.1.15"];

export class SampleUtil {
  /*
  This method generates sample data that can be used for uploading
  */
  public static getSampleUploadData(
    defaults?: SampleUploadData
  ): SampleUploadData {
    const pastDays = 10;
    const collectionDate = SampleUtil.getValueOrDefault(
      defaults?.sample?.collection_date,
      SampleUtil.getADateInThePast(pastDays)
    );
    return {
      pathogen_genome: {
        sequence: defaultSequence,
        sequencing_date: SampleUtil.getValueOrDefault(
          defaults?.pathogen_genome?.sequencing_date,
          SampleUtil.getADateInThePast(pastDays, collectionDate)
        ) as string,
      },
      sample: {
        collection_date: collectionDate as string,
        location_id: SampleUtil.getValueOrDefault(
          defaults?.sample?.location_id,
          locationId
        ) as number,
        private: SampleUtil.getValueOrDefault(
          defaults?.sample?.private,
          false
        ) as boolean,
        private_identifier: SampleUtil.getValueOrDefault(
          defaults?.sample?.private_identifier,
          SampleUtil.generatePrivateSampleId()
        ) as string,
        public_identifier: SampleUtil.getValueOrDefault(
          defaults?.sample?.public_identifier,
          SampleUtil.generatePublicSampleId()
        ) as string,
      },
    };
  }

  // method return synthetic data for stubbing get Sample api
  public static getSampleResponseData(
    defaults?: GetSampleResponseData
  ): GetSampleResponseData {
    const pastDays = 10;
    return {
      id: SampleUtil.getValueOrDefault(
        defaults?.id,
        SampleUtil.getRandomNumber()
      ) as number,
      collection_date: SampleUtil.getADateInThePast(pastDays),
      collection_location: {
        id: SampleUtil.getRandomNumber(),
        region: faker.address.state(),
        country: faker.address.country(),
        division: faker.address.city(),
        location: faker.address.county(),
      },
      czb_failed_genome_recovery: true,
      gisaid: {
        gisaid_id: "",
        status: "Not Found",
      },
      lineage: {
        last_updated: SampleUtil.getADateInThePast(),
        lineage: sample(lineages) as string,
        confidence: "",
        version: "PUSHER-v1.13",
        scorpio_call: "Omicron (BA.1-like)",
        scorpio_support: 0.93,
        qc_status: "pass",
      },
      private: true,
      private_identifier: SampleUtil.generatePrivateSampleId(),
      public_identifier: SampleUtil.generatePublicSampleId(),
      sequencing_date: SampleUtil.getADateInThePast(),
      submitting_group: {
        id: 74,
        name: "QA Automation",
      },
      uploaded_by: {
        id: 108,
        name: "Playwright",
      },
      upload_date: SampleUtil.getADateInThePast(),
    };
  }

  public static getValueOrDefault = function <T>(value: T, defaultValue: T): T {
    return value !== undefined ? value : defaultValue;
  };

  public static getRandomNumber(): number {
    return faker.datatype.number({
      min: 10000,
      max: 99999,
    });
  }
  /*
  This is a helper method for generating public sample id. 
  We use the prefix hCoV-19
  @param {string} country: country where sample was taken, defaults to randomly generated
  */
  public static generatePublicSampleId(country?: string): string {
    const prefix = "hCoV-19";
    const _country = country !== undefined ? country : faker.address.country();
    const _number = SampleUtil.getRandomNumber();
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
}

export interface SampleUploadData {
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

export interface GetSampleResponseData {
  id: number;
  collection_date: string;
  collection_location: {
    id: number;
    region: string;
    country: string;
    division: string;
    location: string;
  };
  czb_failed_genome_recovery: boolean;
  gisaid: {
    gisaid_id: string;
    status: string;
  };
  lineage: {
    last_updated: string;
    lineage: string;
    confidence: string;
    version: string;
    scorpio_call: string;
    scorpio_support: number;
    qc_status: string;
  };
  private: boolean;
  private_identifier: string;
  public_identifier: string;
  sequencing_date: string;
  submitting_group: {
    id: number;
    name: string;
  };
  uploaded_by: {
    id: number;
    name: string;
  };
  upload_date: string;
}
