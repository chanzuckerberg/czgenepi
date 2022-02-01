/**
 * Generate info for downloadable Metadata Template.
 */
import { METADATA_KEYS_TO_HEADERS } from "../../../common/constants";

// Should change below whenever there are material changes to TSV download
export const TEMPLATE_UPDATED_DATE = "2022-02-03"; // YYYY-MM-DD

const DATE_FORMAT = "YYYY-MM-DD";
const BOOLEAN_FORMAT = "Yes/No";

const TEMPLATE_HEADERS = [
  // If position for sampleId changes, update `prepMetadataTemplate` func!
  METADATA_KEYS_TO_HEADERS.sampleId,
  METADATA_KEYS_TO_HEADERS.publicId,
  METADATA_KEYS_TO_HEADERS.collectionDate,
  METADATA_KEYS_TO_HEADERS.collectionLocation,
  METADATA_KEYS_TO_HEADERS.sequencingDate,
  METADATA_KEYS_TO_HEADERS.keepPrivate,
];

// We also use this elsewhere: if we see one of these uploaded, filter it out.
export const EXAMPLE_SAMPLE_IDS = [
  "Example Sample A",
  "Example Sample B",
  "Example Sample C",
];

const EXAMPLE_ROWS = [
  // Very first example row helps explain usage, but not fully valid.
  [
    EXAMPLE_SAMPLE_IDS[0], // sampleId
    "(if available) GISAID ID", // publicId -- here as explainer
    DATE_FORMAT, // collectionDate -- not valid, here as explainer in template
    "North America/USA/California/Los Angeles County", // collectionLocation
    DATE_FORMAT, // sequencingDate -- not valid, here as explainer in template
    BOOLEAN_FORMAT, // keepPrivate -- not valid, here as explainer in template
  ],
  // Subsequent example rows are fully valid: honest-to-goodness examples.
  [
    EXAMPLE_SAMPLE_IDS[1], // sampleId
    "", // publicId -- optional, showing that with blank use
    "2021-04-12", // collectionDate
    "San Francisco County", // collectionLocation
    "", // sequencingDate -- optional, showing that with blank use
    "No", // keepPrivate
  ],
  [
    EXAMPLE_SAMPLE_IDS[2], // sampleId
    "USA/CA-CZB-0001/2021", // publicId
    "2021-10-20", // collectionDate
    "North America/USA/California/San Francisco County", // collectionLocation
    "2021-10-21", // sequencingDate -- optional, showing that with blank use
    "No", // keepPrivate
  ],
];

/**
 * Generates info to create downloadable metadata template TSV (or CSV).
 *
 * Metadata template we provide mostly exists to show the user how to structure
 * their data for uploading it, along with some example rows to help explain
 * what's going on and what the finished thing will look like.
 * Additionally, we put in rows that match the user's previously uploaded
 * sample IDs as a guidepost, but the real purpose of the template is to
 * show the user what the structure they need to conform to.
 *
 * TODO (Vince): The final example row should have its `collectionLocation` set
 * to be the same as user's location. It should use the fully-qualified version
 * of the location (see `stringifyGisaidLocation`, eg if user in San Francisco
 * it will be "North America/USA/California/San Francisco County", not just
 * "San Francisco"). This is intended as a quality-of-life improvement: most
 * of the time, users will just be able to copy that final example downward for
 * all their data rows since most samples will be their location.
 */
export function prepMetadataTemplate(sampleIds: string[]): {
  templateHeaders: string[];
  templateRows: string[][];
} {
  // Most rows in template are just empty rows for user to fill in with data.
  const EMPTY_DATA_ROW: string[] = new Array(TEMPLATE_HEADERS.length).fill("");
  // The only thing we insert to each data row is the sample's ID.
  const data_rows = sampleIds.map((sampleId) => {
    const sample_data_row = [...EMPTY_DATA_ROW];
    // We rely on sampleId position being at `0` index.
    sample_data_row[0] = sampleId;
    return sample_data_row;
  });
  return {
    templateHeaders: TEMPLATE_HEADERS,
    templateRows: [...EXAMPLE_ROWS, ...data_rows],
  };
}
