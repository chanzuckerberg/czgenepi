/**
 * Generate info for downloadable Sample Upload and Edit Metadata Templates.
 */
import { Pathogen } from "src/common/redux/types";
import {
  SAMPLE_UPLOAD_METADATA_KEYS_TO_HEADERS,
  SC2_SAMPLE_EDIT_METADATA_KEYS_TO_HEADERS,
} from "./common/constants";
// Should change below whenever there are material changes to upload TSV download
export const TEMPLATE_UPDATED_DATE = "2022-02-22"; // YYYY-MM-DD

const DATE_FORMAT = "YYYY-MM-DD";
const BOOLEAN_FORMAT = "Yes/No";

// If position for sampleId changes, update `prepMetadataTemplate` func!
// const TEMPLATE_HEADERS = Object.values(SAMPLE_UPLOAD_METADATA_KEYS_TO_HEADERS);

const TEMPLATE_HEADERS_EDIT = [
  SC2_SAMPLE_EDIT_METADATA_KEYS_TO_HEADERS.currentPrivateID,
  SC2_SAMPLE_EDIT_METADATA_KEYS_TO_HEADERS.newPrivateID,
  SC2_SAMPLE_EDIT_METADATA_KEYS_TO_HEADERS.publicId,
  SC2_SAMPLE_EDIT_METADATA_KEYS_TO_HEADERS.collectionDate,
  SC2_SAMPLE_EDIT_METADATA_KEYS_TO_HEADERS.collectionLocation,
  SC2_SAMPLE_EDIT_METADATA_KEYS_TO_HEADERS.sequencingDate,
  SC2_SAMPLE_EDIT_METADATA_KEYS_TO_HEADERS.keepPrivate,
];

// We also use this elsewhere: if we see one of these uploaded, filter it out.
export const EXAMPLE_SAMPLE_IDS = [
  "Example Sample A",
  "Example Sample B",
  "Example Sample C",
];

export const EXAMPLE_CURRENT_PRIVATE_IDENTIFIERS = [
  "example private ID A",
  "example private ID B",
  "example private ID C",
];

const EXAMPLE_ROWS = [
  // Very first example row helps explain usage, but not fully valid.
  [
    EXAMPLE_SAMPLE_IDS[0], // sampleId
    "Private sample name", // privateId
    "(if available) GISAID ID", // publicId -- here as explainer
    DATE_FORMAT, // collectionDate -- not valid, here as explainer in template
    "North America/USA/California/Los Angeles County", // collectionLocation
    DATE_FORMAT, // sequencingDate -- not valid, here as explainer in template
    BOOLEAN_FORMAT, // keepPrivate -- not valid, here as explainer in template
  ],
  // Subsequent example rows are mostly valid, honest-to-goodness examples...
  // ... except for the dates. This is to avoid Excel auto "correct".
  [
    EXAMPLE_SAMPLE_IDS[1], // sampleId
    "id101", // privateId
    "", // publicId -- optional, showing that with blank use
    DATE_FORMAT, // collectionDate
    "San Francisco County", // collectionLocation
    "", // sequencingDate -- optional, showing that with blank use
    "No", // keepPrivate
  ],
  [
    EXAMPLE_SAMPLE_IDS[2], // sampleId
    "id102", // privateId
    "USA/CA-CZB-0001/2021", // publicId
    DATE_FORMAT, // collectionDate
    "North America/USA/California/San Francisco County", // collectionLocation
    DATE_FORMAT, // sequencingDate
    "No", // keepPrivate
  ],
];

const SAMPLE_EDIT_INSTRUCTIONS = [
  ["# Only fill out columns or cells where you want to update the content"],
  ["# Empty cells will not change what is currently in CZ GEN EPI database"],
  ["# Fill cells with 'Delete' if you want to remove the existing content"],
  ["# Save in .tsv .csv or .txt format"],
];

function getEditExampleRows(collectionLocation?: GisaidLocation): string[][] {
  // return example rows with the countys collectionLocation
  const exampleCollectionLocation = collectionLocation
    ? `${collectionLocation.region}/${collectionLocation.country}/${collectionLocation.division}/${collectionLocation.location}`
    : "North America/USA/Californa/Humbolt County";

  return [
    [
      EXAMPLE_CURRENT_PRIVATE_IDENTIFIERS[0], // currentPrivateID
      "X3421876", // newPrivateID
      "hCoV-19/USA/demo-17806/2021", // publicId
      DATE_FORMAT, // collectionDate,
      exampleCollectionLocation, //collectionLocation
      DATE_FORMAT, // sequencingDate
      BOOLEAN_FORMAT, // keepPrivate
    ],
    [
      EXAMPLE_CURRENT_PRIVATE_IDENTIFIERS[1],
      "SOP292344X", // newPrivateID
      "hCoV-19/USA/demo-17807/2021", // publicId
      DATE_FORMAT, // collectionDate,
      exampleCollectionLocation, //collectionLocation
      DATE_FORMAT, // sequencingDate
      BOOLEAN_FORMAT, // keepPrivate
    ],
    [
      EXAMPLE_CURRENT_PRIVATE_IDENTIFIERS[2],
      "T2348ACT", // newPrivateID
      "hCoV-19/USA/demo-17808/2021", // publicId
      DATE_FORMAT, // collectionDate,
      exampleCollectionLocation, //collectionLocation
      "Delete", // sequencingDate
      BOOLEAN_FORMAT, // keepPrivate
    ],
  ];
}

function getEmptyDataRows(_metadataKeysToHeaders: string[]): string[] {
  // provide rows in template that are just empty rows for user to fill in with data.
  return new Array(_metadataKeysToHeaders.length).fill("");
}

function getDataRows(
  sampleIds: string[],
  EMPTY_DATA_ROW: string[]
): string[][] {
  return sampleIds.map((sampleId) => {
    const sample_data_row = [...EMPTY_DATA_ROW];
    // We rely on sampleId position being at `0` index.
    sample_data_row[0] = sampleId; // this is the current private_id
    return sample_data_row;
  });
}

/**
 * Generates info to create downloadable metadata template TSV (or CSV).
 *
 * Metadata template we provide mostly exists to show the user how to structure
 * their data for uploading it, along with some example rows to help explain
 * what's going on and what the finished thing will look like.
 * Additionally, we put in rows that match the user's previously uploaded
 * sample IDs (or in the sample edit case the already existing Private Identifier) as a guidepost,
 *  but the real purpose of the template is to show the user what the structure they need to conform to.
 *
 * TODO (Vince): The final example row should have its `collectionLocation` set
 * to be the same as user's location. It should use the fully-qualified version
 * of the location (see `stringifyGisaidLocation`, eg if user in San Francisco
 * it will be "North America/USA/California/San Francisco County", not just
 * "San Francisco"). This is intended as a quality-of-life improvement: most
 * of the time, users will just be able to copy that final example downward for
 * all their data rows since most samples will be their location.
 */
export function prepUploadMetadataTemplate(
  sampleIds: string[],
  pathogen: Pathogen
): {
  templateHeaders: string[];
  templateRows: string[][];
} {
  const TEMPLATE_HEADERS = Object.values(
    SAMPLE_UPLOAD_METADATA_KEYS_TO_HEADERS[pathogen]
  );
  // Most rows in template are just empty rows for user to fill in with data.
  const EMPTY_DATA_ROW = getEmptyDataRows(TEMPLATE_HEADERS);
  const data_rows = getDataRows(sampleIds, EMPTY_DATA_ROW);
  return {
    templateHeaders: TEMPLATE_HEADERS,
    templateRows: [...EXAMPLE_ROWS, ...data_rows],
  };
}

export function prepEditMetadataTemplate(
  sampleIds: string[],
  collectionLocation?: GisaidLocation
): {
  templateInstructionRows: string[][];
  templateHeaders: string[];
  templateRows: string[][];
} {
  const EMPTY_DATA_ROW = getEmptyDataRows(TEMPLATE_HEADERS_EDIT);
  const data_rows = getDataRows(sampleIds, EMPTY_DATA_ROW);
  const EXAMPLE_ROWS_EDIT = getEditExampleRows(collectionLocation);
  return {
    templateInstructionRows: SAMPLE_EDIT_INSTRUCTIONS,
    templateHeaders: TEMPLATE_HEADERS_EDIT,
    templateRows: [...EXAMPLE_ROWS_EDIT, ...data_rows],
  };
}
