import { faker } from "@faker-js/faker";
import { sample } from "lodash";
import { GeneralUtil } from "./general";

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
    const collectionDate = GeneralUtil.getValueOrDefault(
      defaults?.sample?.collection_date,
      GeneralUtil.getADateInThePast(pastDays)
    );
    return {
      pathogen_genome: {
        sequence: defaultSequence,
        sequencing_date: GeneralUtil.getValueOrDefault(
          defaults?.pathogen_genome?.sequencing_date,
          GeneralUtil.getADateInThePast(pastDays, collectionDate)
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
          false
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

  // method return synthetic data for stubbing get Sample api
  public static getSampleResponseData(
    defaults?: GetSampleResponseData
  ): GetSampleResponseData {
    const pastDays = 10;
    return {
      id: GeneralUtil.getValueOrDefault(
        defaults?.id,
        GeneralUtil.getRandomNumber()
      ) as number,
      collection_date: GeneralUtil.getADateInThePast(pastDays),
      collection_location: {
        id: GeneralUtil.getRandomNumber(),
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
        last_updated: GeneralUtil.getADateInThePast(),
        lineage: sample(lineages) as string,
        confidence: "",
        version: "PUSHER-v1.13",
        scorpio_call: "Omicron (BA.1-like)",
        scorpio_support: 0.93,
        qc_status: "pass",
      },
      private: true,
      private_identifier: GeneralUtil.generatePrivateSampleId(),
      public_identifier: GeneralUtil.generatePublicSampleId(),
      sequencing_date: GeneralUtil.getADateInThePast(),
      submitting_group: {
        id: 74,
        name: "QA Automation",
      },
      uploaded_by: {
        id: 108,
        name: "Playwright",
      },
      upload_date: GeneralUtil.getADateInThePast(),
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
