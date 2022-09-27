import { sample } from "lodash";
import {
  getADateInThePast,
  getValueOrDefault,
  generatePrivateSampleId,
  generatePublicSampleId,
  getRandomNumber,
} from "./common";
import * as dotenv from "dotenv";

dotenv.config();

const lineages = ["A", "BA.1.1", "BA.1.15"]; //todo: will be good to get this from API and then choose randomly

//add more locations as required
const locations = [
  "Africa/Angola/Luanda/Calemba",
  "Europe/Russia/Kaluga/Tarusa",
  "Asia/China",
];
/**
 * This method generates sample data that can be used for uploading
 * @param defaults - user supplied sample data to be included
 * @param maxCollectionDateAge  - specifies earliest day of the sample.
 * e.g. 5 means sample collection date will be no earlier than 5 days
 * @returns SampleUploadData
 */
export function createSampleUploadData(
  defaults?: SampleUploadData,
  maxCollectionDateAge = 10
): SampleUploadData {
  const collectionDate = getValueOrDefault(
    defaults?.collection_date,
    getADateInThePast(maxCollectionDateAge)
  );
  const sequencingDate = getValueOrDefault(
    defaults?.sequencing_date,
    getADateInThePast(maxCollectionDateAge)
  );
  return {
    collection_date: collectionDate,
    location: getValueOrDefault(
      defaults?.location,
      sample(locations)
    ) as string,
    private: getValueOrDefault(defaults?.private, false) as boolean,
    private_id: getValueOrDefault(
      defaults?.private_id,
      generatePrivateSampleId()
    ) as string,
    public_id: getValueOrDefault(
      defaults?.public_id,
      generatePublicSampleId()
    ) as string,
    sequencing_date: sequencingDate,
  };
}

/**
 * method creates synthetic data for stubbing get Sample api response
 * @param defaults - user supplied sample data to be included
 * @param maxCollectionDateAge  - specifies earliest day of the sample.
 * e.g. 5 means sample collection date will be no earlier than 5 days
 * @returns GetSampleResponseData
 */
export function getSampleResponseData(
  defaults?: GetSampleResponseData,
  maxCollectionDateAge = 10
): GetSampleResponseData {
  return {
    collection_date: getADateInThePast(maxCollectionDateAge),
    collection_location: {
      country: "USA",
      division: "California",
      id: getRandomNumber(),
      location: "Corodano",
      region: "California",
    },
    czb_failed_genome_recovery: true,
    gisaid: {
      gisaid_id: "",
      status: "Not Found",
    },
    id: getValueOrDefault(defaults?.id, getRandomNumber()) as number,
    lineage: {
      confidence: "",
      last_updated: getADateInThePast(),
      lineage: sample(lineages) as string,
      qc_status: "pass",
      scorpio_call: "Omicron (BA.1-like)",
      scorpio_support: 0.93,
      version: "PUSHER-v1.13",
    },
    private: getValueOrDefault(defaults?.private, true) as boolean,
    private_identifier: generatePrivateSampleId(),
    public_identifier: generatePublicSampleId(),
    sequencing_date: getADateInThePast(),
    submitting_group: {
      id: 74,
      name: "QA Automation",
    },
    upload_date: getADateInThePast(),
    uploaded_by: {
      id: 108,
      name: "Playwright",
    },
  };
}

export interface SampleUploadData {
  collection_date: any;
  location: any;
  private: boolean;
  private_id: any;
  public_id: any;
  sequencing_date: any;
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
