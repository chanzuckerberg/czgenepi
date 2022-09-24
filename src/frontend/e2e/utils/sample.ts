import { sample } from "lodash";
import {
  generatePrivateSampleId,
  generatePublicSampleId,
  getADateInThePast,
  getRandomNumber,
  getValueOrDefault,
} from "./common";
import * as dotenv from "dotenv";

dotenv.config();

const defaultSequence =
  "ATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTCATTAAAGCCCCCAAGTC";
const locationId = 166768; //todo: will be good to get this from API and then choose randomly
const lineages = ["A", "BA.1.1", "BA.1.15"]; //todo: will be good to get this from API and then choose randomly
const trueOrFalse = [true, false];

/**
 * This method generates sample data that can be used for uploading
 * @param defaults - user supplied sample data to be included
 * @param maxCollectionDateAge  - specifies earliest day of the sample.
 * e.g. 5 means sample collection date will be no earlier than 5 days
 * @returns SampleUploadData
 */
export function getSampleUploadData(
  defaults?: SampleUploadData,
  minCollectionDays = 0,
  maxCollectionDays = 10
): SampleUploadData {
  const collectionDate = getValueOrDefault(
    defaults?.sample?.collection_date,
    getADateInThePast(minCollectionDays)
  );
  return {
    pathogen_genome: {
      sequence: defaultSequence,
      sequencing_date: getValueOrDefault(
        defaults?.pathogen_genome?.sequencing_date,
        getADateInThePast(minCollectionDays, maxCollectionDays, collectionDate)
      ) as string,
    },
    sample: {
      collection_date: collectionDate as string,
      location_id: getValueOrDefault(
        defaults?.sample?.location_id,
        locationId
      ) as number,
      private: getValueOrDefault(
        defaults?.sample?.private,
        sample(trueOrFalse)
      ) as boolean,
      private_identifier: getValueOrDefault(
        defaults?.sample?.private_identifier,
        generatePrivateSampleId()
      ) as string,
      public_identifier: getValueOrDefault(
        defaults?.sample?.public_identifier,
        generatePublicSampleId()
      ) as string,
    },
  };
}

/**
 * method creates synthetic data for stubbing get Sample api response
 * @param defaults - user supplied sample data to be included
 * @param maxDays  - specifies earliest day of the sample, defaults 10
 * @param minDays  - specifies lates day of the sample default 0 (today).
 * @returns GetSampleResponseData
 */
export function getSampleResponseData(
  defaults?: Partial<SampleResponseDefaults>,
  minDays = 0,
  maxDays = 10
): SampleResponseData {
  return {
    collection_date: getADateInThePast(minDays, maxDays),
    collection_location: {
      country: "USA",
      division: "California",
      id: getValueOrDefault(
        defaults?.collection_location,
        locationId
      ) as number,
      location: "Corodano",
      region: "California",
    },
    czb_failed_genome_recovery: getValueOrDefault(
      defaults?.czb_failed_genome_recovery,
      sample(trueOrFalse)
    ) as boolean,
    gisaid: {
      gisaid_id: "",
      status: "Not Found",
    },
    id: getValueOrDefault(defaults?.id, getRandomNumber()) as number,
    lineage: {
      confidence: "",
      last_updated: getADateInThePast(),
      lineage: getValueOrDefault(defaults?.lineage, sample(lineages)) as string,
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
    upload_date: getValueOrDefault(
      defaults?.upload_date,
      getADateInThePast()
    ) as string,
    uploaded_by: {
      id: 108,
      name: "Playwright",
    },
  };
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

export interface SampleResponseData {
  id: number;
  collection_date: string;
  collection_location: {
    id?: number;
    region: string;
    country: string;
    division: string;
    location: string;
  };
  czb_failed_genome_recovery: boolean;
  gisaid: {
    gisaid_id: any;
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

export interface SampleResponseDefaults {
  collection_date?: string;
  collection_location?: number;
  czb_failed_genome_recovery?: boolean;
  gisaid_id?: any;
  gisaid_status?: string;
  id?: number;
  lineage?: string;
  private?: boolean;
  upload_date?: string;
}
