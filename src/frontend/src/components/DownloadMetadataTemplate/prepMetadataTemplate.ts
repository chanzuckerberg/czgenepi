/**
 * Generate info for downloadable Sample Upload and Edit Metadata Templates.
 */
import { store } from "src/common/redux";
import { selectCurrentPathogen } from "src/common/redux/selectors";
import { Pathogen } from "src/common/redux/types";
import { PathogenConfigType } from "src/common/types/strings";
import {
  getEditExampleRows,
  SAMPLE_EDIT_METADATA_KEYS_TO_HEADERS,
  SAMPLE_UPLOAD_METADATA_KEYS_TO_HEADERS,
  UPLOAD_EXAMPLE_ROWS,
} from "./common/constants";

interface TemplateUpdatedDate {
  updatedDate: string;
}
// Should change below whenever there are material changes to upload TSV download
export const TEMPLATE_UPDATED_DATE: PathogenConfigType<TemplateUpdatedDate> = {
  [Pathogen.COVID]: {
    updatedDate: "2022-02-22", // YYYY-MM-DD
  },
  [Pathogen.MONKEY_POX]: {
    updatedDate: "2022-12-01", // YYYY-MM-DD
  },
};

// If a future pathogen has different headers, we'll need to modify this.
function getUploadTemplateHeaders(pathogen: Pathogen): string[] {
  return [
    SAMPLE_UPLOAD_METADATA_KEYS_TO_HEADERS[pathogen].sampleId,
    SAMPLE_UPLOAD_METADATA_KEYS_TO_HEADERS[pathogen].privateId,
    SAMPLE_UPLOAD_METADATA_KEYS_TO_HEADERS[pathogen].publicId,
    SAMPLE_UPLOAD_METADATA_KEYS_TO_HEADERS[pathogen].collectionDate,
    SAMPLE_UPLOAD_METADATA_KEYS_TO_HEADERS[pathogen].collectionLocation,
    SAMPLE_UPLOAD_METADATA_KEYS_TO_HEADERS[pathogen].sequencingDate,
    SAMPLE_UPLOAD_METADATA_KEYS_TO_HEADERS[pathogen].keepPrivate,
  ];
}

const SAMPLE_EDIT_INSTRUCTIONS = [
  ["# Only fill out columns or cells where you want to update the content"],
  ["# Empty cells will not change what is currently in CZ GEN EPI database"],
  ["# Fill cells with 'Delete' if you want to remove the existing content"],
  ["# Save in .tsv .csv or .txt format"],
];

function getEditTemplateHeaders(pathogen: Pathogen): string[] {
  return [
    SAMPLE_EDIT_METADATA_KEYS_TO_HEADERS[pathogen].currentPrivateID,
    SAMPLE_EDIT_METADATA_KEYS_TO_HEADERS[pathogen].newPrivateID,
    SAMPLE_EDIT_METADATA_KEYS_TO_HEADERS[pathogen].publicId,
    SAMPLE_EDIT_METADATA_KEYS_TO_HEADERS[pathogen].collectionDate,
    SAMPLE_EDIT_METADATA_KEYS_TO_HEADERS[pathogen].collectionLocation,
    SAMPLE_EDIT_METADATA_KEYS_TO_HEADERS[pathogen].sequencingDate,
    SAMPLE_EDIT_METADATA_KEYS_TO_HEADERS[pathogen].keepPrivate,
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
  const TEMPLATE_HEADERS = getUploadTemplateHeaders(pathogen);

  // Most rows in template are just empty rows for user to fill in with data.
  const EMPTY_DATA_ROW = getEmptyDataRows(TEMPLATE_HEADERS);
  const data_rows = getDataRows(sampleIds, EMPTY_DATA_ROW);
  return {
    templateHeaders: TEMPLATE_HEADERS,
    templateRows: [...UPLOAD_EXAMPLE_ROWS[pathogen], ...data_rows],
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
  const state = store.getState();
  const pathogen = selectCurrentPathogen(state);

  const TEMPLATE_HEADERS_EDIT = getEditTemplateHeaders(pathogen);

  const EMPTY_DATA_ROW = getEmptyDataRows(TEMPLATE_HEADERS_EDIT);
  const data_rows = getDataRows(sampleIds, EMPTY_DATA_ROW);
  const EXAMPLE_ROWS_EDIT = getEditExampleRows(pathogen, collectionLocation);
  return {
    templateInstructionRows: SAMPLE_EDIT_INSTRUCTIONS,
    templateHeaders: TEMPLATE_HEADERS_EDIT,
    templateRows: [...EXAMPLE_ROWS_EDIT, ...data_rows],
  };
}
