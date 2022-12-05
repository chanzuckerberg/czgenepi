import { sample } from "lodash";
import {
  getADateInThePast,
  getValueOrDefault,
  generatePrivateSampleId,
  generatePublicSampleId,
  getRandomNumber,
  getLocations,
} from "./common";
import * as dotenv from "dotenv";
import { SampleResponseDefaults } from "./schemas/sampleResponseDefaults";
import { SampleResponseData } from "./schemas/sampleResponseData";
import { SampleUploadData } from "./schemas/sampleUploadData";

dotenv.config();

const lineages: string[] = ["A", "BA.1.1", "BA.1.15"]; //todo: will be good to get this from API and then choose randomly

const locations = getLocations();
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
    location: getValueOrDefault(defaults?.location, sample(locations)),
    private: getValueOrDefault(defaults?.private, false),
    private_id: getValueOrDefault(
      defaults?.private_id,
      generatePrivateSampleId()
    ),
    public_id: getValueOrDefault(defaults?.public_id, generatePublicSampleId()),
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
  defaults?: SampleResponseDefaults,
  maxCollectionDateAge = 10
): SampleResponseData {
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
    id: getValueOrDefault(defaults?.id, getRandomNumber()),
    lineages: [
      {
        lineage_type: "PANGOLIN",
        last_updated: getADateInThePast(),
        lineage: lineages[Math.floor(Math.random() * lineages.length)],
        qc_status: "pass",
        scorpio_call: "Omicron (BA.1-like)",
        scorpio_support: "0.93",
        lineage_software_version: "PUSHER-v1.13",
      },
    ],
    qc_metrics: [
      {
        qc_score: "1.12234",
        qc_software_version: "1.0.0",
        qc_status: "good",
        qc_caller: "NEXTCLADE",
      },
    ],
    private: getValueOrDefault(defaults?.private, true),
    private_identifier: generatePrivateSampleId(),
    public_identifier: generatePublicSampleId(),
    sequencing_date: getADateInThePast(),
    submitting_group: {
      id: 74,
      name: "QA Automation",
    },
    upload_date: getValueOrDefault(defaults?.upload_date, getADateInThePast()),
    uploaded_by: {
      id: 108,
      name: "Playwright",
    },
  };
}
