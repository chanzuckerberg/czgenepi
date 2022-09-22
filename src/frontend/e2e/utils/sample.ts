import { faker } from "@faker-js/faker";
import { sample } from "lodash";
import { GeneralUtil } from "./general";
import * as dotenv from "dotenv";

dotenv.config();

const defaultSequence =
  "ATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTC";
const locationId = 166768; //todo: will be good to get this from API and then choose randomly
const lineages = ["A", "BA.1.1", "BA.1.15"]; //todo: will be good to get this from API and then choose randomly
const trueOrFalse = [true, false];
export class SampleUtil {
  /**
   * This method generates sample data that can be used for uploading
   * @param defaults - user supplied sample data to be included
   * @param maxCollectionDateAge  - specifies earliest day of the sample.
   * e.g. 5 means sample collection date will be no earlier than 5 days
   * @returns SampleUploadData
   */
  public static getSampleUploadData(
    defaults?: SampleUploadData,
    maxCollectionDateAge = 10
  ): SampleUploadData {
    const collectionDate = GeneralUtil.getValueOrDefault(
      defaults?.sample?.collection_date,
      GeneralUtil.getADateInThePast(maxCollectionDateAge)
    );
    return {
      pathogen_genome: {
        sequence: defaultSequence,
        sequencing_date: GeneralUtil.getValueOrDefault(
          defaults?.pathogen_genome?.sequencing_date,
          GeneralUtil.getADateInThePast(maxCollectionDateAge, collectionDate)
        ) as string,
      },
      sample: {
        collection_date: collectionDate as string,
        location_id: GeneralUtil.getValueOrDefault(
          defaults?.sample?.location_id,
          locationId
        ) as number,
        private: GeneralUtil.getValueOrDefault(
          defaults?.sample?.private,
          sample(trueOrFalse)
        ) as boolean,
        private_identifier: GeneralUtil.getValueOrDefault(
          defaults?.sample?.private_identifier,
          GeneralUtil.generatePrivateSampleId()
        ) as string,
        public_identifier: GeneralUtil.getValueOrDefault(
          defaults?.sample?.public_identifier,
          GeneralUtil.generatePublicSampleId()
        ) as string,
      },
    };
  }

  /**
   * method creates synthetic data for stubbing get Sample api response
   * @param defaults - user supplied sample data to be included
   * @param maxCollectionDateAge  - specifies earliest day of the sample.
   * e.g. 5 means sample collection date will be no earlier than 5 days
   * @returns GetSampleResponseData
   */
  public static getSampleResponseData(
    maxCollectionDateAge = 10,
    defaults?: GetSampleResponseData
  ): GetSampleResponseData {
    return {
      collection_date: GeneralUtil.getADateInThePast(maxCollectionDateAge),
      collection_location: {
        country: faker.address.country(),
        division: faker.address.city(),
        id: GeneralUtil.getRandomNumber(),
        location: faker.address.county(),
        region: faker.address.state(),
      },
      czb_failed_genome_recovery: GeneralUtil.getValueOrDefault(
        defaults?.czb_failed_genome_recovery,
        sample(trueOrFalse)
      ) as boolean,
      gisaid: {
        gisaid_id: "",
        status: "Not Found",
      },
      id: GeneralUtil.getValueOrDefault(
        defaults?.id,
        GeneralUtil.getRandomNumber()
      ) as number,
      lineage: {
        confidence: "",
        last_updated: GeneralUtil.getADateInThePast(),
        lineage: sample(lineages) as string,
        qc_status: "pass",
        scorpio_call: "Omicron (BA.1-like)",
        scorpio_support: 0.93,
        version: "PUSHER-v1.13",
      },
      private: GeneralUtil.getValueOrDefault(
        defaults?.private,
        sample(trueOrFalse)
      ) as boolean,
      private_identifier: GeneralUtil.generatePrivateSampleId(),
      public_identifier: GeneralUtil.generatePublicSampleId(),
      sequencing_date: GeneralUtil.getADateInThePast(),
      submitting_group: {
        id: 74,
        name: "QA Automation",
      },
      upload_date: GeneralUtil.getADateInThePast(),
      uploaded_by: {
        id: 108,
        name: "Playwright",
      },
    };
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
  upload_date: string;
  uploaded_by: {
    id: number;
    name: string;
  };
}
