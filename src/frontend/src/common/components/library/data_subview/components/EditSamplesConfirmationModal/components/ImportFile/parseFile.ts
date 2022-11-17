import { groupBy, isEmpty, pick } from "lodash";
import Papa from "papaparse";
import { getHeadersToSampleEditMetadataKeys } from "src/common/components/library/data_subview/components/EditSamplesConfirmationModal/components/common/constants";
import { store } from "src/common/redux";
import { selectCurrentPathogen } from "src/common/redux/selectors";
import { Pathogen } from "src/common/redux/types";
import { StringToLocationFinder } from "src/common/utils/locationUtils";
import { DATE_REGEX } from "src/components/DateField/constants";
import {
  EXAMPLE_CURRENT_PRIVATE_IDENTIFIERS,
  SAMPLE_EDIT_METADATA_KEYS_TO_HEADERS,
} from "src/components/DownloadMetadataTemplate/common/constants";
import { SampleEditTsvMetadata } from "src/components/DownloadMetadataTemplate/common/types";
import { SAMPLE_EDIT_WEBFORM_METADATA_KEYS_TO_HEADERS } from "src/components/WebformTable/common/constants";
import {
  ERROR_CODE,
  SampleEditMetadataWebform,
  SampleIdToEditMetadataWebform,
  WARNING_CODE,
} from "src/components/WebformTable/common/types";
import {
  EMPTY_METADATA,
  FORBIDDEN_NAME_CHARACTERS_REGEX,
  MAX_NAME_LENGTH,
} from "src/views/Upload/components/common/constants";
import {
  inferMetadataType,
  inferValue,
} from "src/views/Upload/components/Metadata/components/ImportFile/parseFile";

type MergedSampleEditTsvWebformMetadata = SampleEditTsvMetadata &
  SampleEditMetadataWebform;

export type SampleIdToWarningMessages = Record<
  string,
  Set<keyof SampleEditMetadataWebform>
>;

type WarningMessages = Map<WARNING_CODE, SampleIdToWarningMessages>;
type ErrorMessages = Map<ERROR_CODE, Set<string> | null>;

export interface ParseResult {
  data: SampleIdToEditMetadataWebform;
  errorMessages: ErrorMessages;
  warningMessages: WarningMessages;
  filename: string;
  hasUnknownFields: boolean;
  extraneousSampleIds: string[];
}

export type SampleEditIdToWarningMessages = Record<
  string,
  Set<keyof SampleEditMetadataWebform>
>;

interface ParsedRowSampleEditTsv {
  rowMetadata: SampleEditTsvMetadata | null; // null if row can't be parsed
  // Below is an empty map if row has no warnings during parse
  rowWarnings: Map<WARNING_CODE, Set<keyof SampleEditMetadataWebform>>;
  // Note that we don't currently have any breaking errors at row parse level
}

function warnBadFormatMetadata(
  metadata: SampleEditMetadataWebform
): Set<keyof SampleEditMetadataWebform> | null {
  const badFormatMetadata = new Set<keyof SampleEditMetadataWebform>();

  const { privateId } = metadata;
  if (
    privateId &&
    (privateId.length > MAX_NAME_LENGTH ||
      FORBIDDEN_NAME_CHARACTERS_REGEX.test(privateId))
  ) {
    badFormatMetadata.add("privateId");
  }

  const DATE_FIELDS = ["collectionDate", "sequencingDate"] as const;
  DATE_FIELDS.forEach((dateKey) => {
    const dateField = metadata[dateKey];
    if (dateField && !DATE_REGEX.test(dateField)) {
      badFormatMetadata.add(dateKey);
    }
  });

  return badFormatMetadata.size ? badFormatMetadata : null;
}

function getMissingHeaderFields(
  uploadedHeaders: string[],
  pathogen: Pathogen
): Set<string> | null {
  const missingFields = new Set<string>();
  if (!uploadedHeaders.includes("currentPrivateID")) {
    missingFields.add(
      SAMPLE_EDIT_METADATA_KEYS_TO_HEADERS[pathogen].currentPrivateID
    );
  }
  return missingFields.size !== 0 ? missingFields : null;
}

function getDuplicateIds(
  rows: Record<string, string>[],
  identifierColumnName: string
) {
  const idCounts = groupBy(rows, identifierColumnName);
  const dups = new Set<string>();

  for (const [key, value] of Object.entries(idCounts)) {
    // duplicates don't count for '' (as that means user does not want to change these values)
    // duplicates also do not count if undefined (this means a user deleted this non required column)
    const keyIsAValue =
      key !== "" && key !== "undefined" && key.toLowerCase() !== "delete";
    if (value.length > 1 && keyIsAValue) {
      dups.add(key);
    }
  }
  return dups;
}

function filterExtraneousSampleIds(
  rows: Record<string, string>[],
  editableSampleIds: Set<string>,
  exampleSampleIds: Set<string>
) {
  const extraneousUniqueSampleIds = new Set<string>();

  const filteredRows = rows.filter((item) => {
    const currentPID = item.currentPrivateID;
    if (
      !editableSampleIds.has(currentPID) &&
      !exampleSampleIds.has(currentPID)
    ) {
      // if currentPID is a blank string don't import data for that row (most likely this is an empty line)
      if (currentPID !== "") {
        extraneousUniqueSampleIds.add(currentPID);
      }
    } else {
      return item;
    }
  });
  const extraneousSampleIds: string[] = [...extraneousUniqueSampleIds];
  return { extraneousSampleIds, filteredRows };
}

export function warnMissingMetadata(
  metadata: SampleEditMetadataWebform
): Set<keyof SampleEditMetadataWebform> | null {
  const missingMetadata = new Set<keyof SampleEditMetadataWebform>();
  const ALWAYS_REQUIRED: Array<keyof SampleEditMetadataWebform> = [
    "privateId",
    "collectionDate",
    "collectionLocation",
  ];
  ALWAYS_REQUIRED.forEach((keyRequiredMetadata) => {
    if (!metadata[keyRequiredMetadata]) {
      missingMetadata.add(keyRequiredMetadata);
    }
  });
  return missingMetadata.size ? missingMetadata : null;
}

function inferMetadata({
  row,
  key,
  rowMetadata,
  stringToLocationFinder,
}: inferMetadataType): void {
  const originalValue: string | undefined = row[key];
  // Only overwrite sane defaults if a "real" value was pulled for key
  if (originalValue) {
    inferValue({ key, row, stringToLocationFinder, rowMetadata });
  } else {
    (rowMetadata[key] as string | undefined) = originalValue;
  }
}

/**
 * Parses a single data row. If issues during parse, also reports warnings.
 *
 * In some cases, the row can not or should not be parsed -- eg if malformed
 * or data is considered extraneous -- in that case, returned object will have
 * `rowMetadata` set to `null` to indicate to caller to ignore the row's info.
 *
 * Args:
 *   - row: Data row /after/ ingestion by Papa.parse, not the raw text row.
 *       Row needs to be brought in as an object with data matched to keys.
 *   - stringToLocationFinder: Function that converts user-provided string of
 *       a location to closest matching internally used Location object.
 *   - ignoredSampleIds: Any IDs that, if encountered, mean row is ignored.
 *       Mostly exists to filter out the metadata template's example rows.
 */

function parseRow(
  row: Record<string, string>,
  stringToLocationFinder: StringToLocationFinder,
  ignoredSampleIds: Set<string>
): ParsedRowSampleEditTsv {
  const state = store.getState();
  const pathogen = selectCurrentPathogen(state);

  const rowWarnings: ParsedRowSampleEditTsv["rowWarnings"] = new Map();
  // If row has no sampleId, we can't tie it to a sample, so we drop it.
  // Some sampleIds (ie, ones for examples) also signal we should ignore row.
  if (!row.currentPrivateID || ignoredSampleIds.has(row.currentPrivateID)) {
    return {
      rowMetadata: null, // Indicates to caller row had nothing to parse.
      rowWarnings,
    };
  }

  const rowMetadata: SampleEditTsvMetadata = {
    // Ensure that rowMetadata will be sane even if row has no values
    ...EMPTY_METADATA,
  };

  const SAMPLE_EDIT_METADATA_KEYS_TO_EXTRACT = Object.values(
    getHeadersToSampleEditMetadataKeys(pathogen)
  );
  // Only extract info we care about from the row. Set `rowMetadata` with it.
  SAMPLE_EDIT_METADATA_KEYS_TO_EXTRACT.forEach((key) => {
    inferMetadata({ key, row, stringToLocationFinder, rowMetadata });
  });
  const rowBadFormatWarnings = warnBadFormatMetadata(rowMetadata);
  if (rowBadFormatWarnings) {
    rowWarnings.set(WARNING_CODE.BAD_FORMAT_DATA, rowBadFormatWarnings);
  }

  return {
    rowMetadata,
    rowWarnings,
  };
}

/**
 * Parses user-uploaded file of metadata into form useable by app.
 *
 * In addition to parsing out the data appropriately, records any warnings
 * and errors that were encountered (eg, a field was missing, etc) so that
 * those can be displayed to the user after pasing is complete.
 *
 * In the case of some errors -- eg, missing column headers -- we consider it
 * so egregious we do not load any data from the file. User just gets an
 * error message telling them they need to fix it before we allow loading.
 *
 * Generally, this parses all entries in file and makes no attempt fo filter
 * the uploaded metadata down to the samples user user has previously uploaded.
 * For example, if user uploaded only sample A, but then uploads metadata for
 * both A and B, this function will parse out both A and B. Filtering that
 * result down (in prior example, filtering to just A) is the responsibility
 * of the caller.
 *
 * There is one exception to the above though: example rows. We do filter out
 * any rows that match example rows we use in our metadata template. Basically,
 * if it could possibly be "real" data, we do not filter it, but for example
 * rows they left in from downloading our template, we do filter those.
 *
 * Note (Vince): It would probably be more elegant to perform the filtering
 * entirely inside the parseFile. It would be easy to pass down the sampleIds
 * to the parsing step, and filter out any metadata that does not match samples
 * that were previously uploaded. However, that would break how some warnings
 * currently work -- elsewhere, the Metadata components assume they'll be doing
 * the filtering and generate/show warnings accordingly. It could be reworked,
 * but I just don't have the time right now, so I'm leaving it alone. (That's
 * also why the example rows must be filtered here -- matching what downstream
 * consumers previously expected for how results will be structured.)
 */

export function parseFileEdit(
  file: File,
  editableSampleIds: Set<string>,
  stringToLocationFinder: StringToLocationFinder
): Promise<ParseResult> {
  const state = store.getState();
  const pathogen = selectCurrentPathogen(state);

  function convertHeaderToMetadataKey(headerName: string): string {
    const HEADERS_TO_SAMPLE_EDIT_METADATA_KEYS =
      getHeadersToSampleEditMetadataKeys(pathogen);
    return HEADERS_TO_SAMPLE_EDIT_METADATA_KEYS[headerName] || headerName;
  }

  return new Promise((resolve) => {
    Papa.parse(file, {
      header: true, // Imported file starts with a header row
      // We parse the column headers to their corresponding metadata keys
      comments: "#",
      transformHeader: convertHeaderToMetadataKey,
      // Because file parsing is async, we need to use callback on `complete`
      complete: ({
        data: rows,
        meta: papaParseMeta,
      }: Papa.ParseResult<Record<string, string>>) => {
        const uploadedHeaders: string[] = papaParseMeta.fields || []; // available b/c `header: true`
        // Init -- Will modify these in place as we work through incoming rows.
        const sampleIdToMetadata: SampleIdToEditMetadataWebform = {};
        const errorMessages = new Map<ERROR_CODE, Set<string> | null>();
        const warningMessages = new Map<
          WARNING_CODE,
          SampleIdToWarningMessages
        >();
        const IGNORED_SAMPLE_IDS = new Set(EXAMPLE_CURRENT_PRIVATE_IDENTIFIERS);
        let hasUnknownFields = false;
        const missingHeaderFields = getMissingHeaderFields(
          uploadedHeaders,
          pathogen
        );
        const duplicatePublicIds = getDuplicateIds(rows, "publicId");
        const duplicatePrivateIds = getDuplicateIds(rows, "newPrivateID");
        const { extraneousSampleIds, filteredRows } = filterExtraneousSampleIds(
          rows,
          editableSampleIds,
          IGNORED_SAMPLE_IDS
        );

        if (missingHeaderFields) {
          errorMessages.set(ERROR_CODE.MISSING_FIELD, missingHeaderFields);
        }
        if (duplicatePublicIds) {
          errorMessages.set(
            ERROR_CODE.DUPLICATE_PUBLIC_IDS,
            duplicatePublicIds
          );
        }
        if (duplicatePrivateIds) {
          errorMessages.set(
            ERROR_CODE.DUPLICATE_PRIVATE_IDS,
            duplicatePrivateIds
          );
        }
        const uploadErrors =
          !missingHeaderFields && !duplicatePrivateIds && !duplicatePublicIds;

        if (!uploadErrors) {
          // We only ingest file's data if user had all expected fields. and if there are no duplicate identifiers in the upload
          // find if any extraneous field data was added in the tsv
          const expectedHeaders = Object.keys(
            SAMPLE_EDIT_METADATA_KEYS_TO_HEADERS[pathogen]
          );
          const unknownFields = uploadedHeaders.filter(
            // uploaded field header is allowed to be "" (that means a user deleted a non-required column which is not a blocker)
            (uploadedHeader) =>
              !expectedHeaders.includes(uploadedHeader) && uploadedHeader !== ""
          );
          if (!isEmpty(unknownFields)) {
            hasUnknownFields = true;
          }
          filteredRows.forEach((row) => {
            const { rowMetadata, rowWarnings } = parseRow(
              row,
              stringToLocationFinder,
              IGNORED_SAMPLE_IDS
            );
            // If false-y, there was no parse result, so we just skip those
            if (rowMetadata) {
              // now that we've parsed the tsv we need to transform the metadata row
              // from SampleEditTsvMetadata to SampleEditMetadataWebform to do this we
              // need the a type to transition us (MergedSampleEditTsvWebformMetadata)
              const rowMetadataNew: MergedSampleEditTsvWebformMetadata =
                rowMetadata;
              const rowPrivateID: string =
                rowMetadataNew.currentPrivateID || "";

              rowMetadataNew.privateId = rowMetadataNew["newPrivateID"];
              sampleIdToMetadata[rowPrivateID] = pick(
                rowMetadataNew,
                Object.keys(
                  SAMPLE_EDIT_WEBFORM_METADATA_KEYS_TO_HEADERS[pathogen]
                )
              ) as SampleEditMetadataWebform;
              // If row had warnings, fold them into the overall warnings.
              // If row had no warnings, forEach is a no-op since no entries.
              rowWarnings.forEach((warnStatements, warningType) => {
                let warnRecordForType = warningMessages.get(warningType);
                if (warnRecordForType === undefined) {
                  // Haven't encountered this warning type until now, do init
                  warnRecordForType = {};
                  warningMessages.set(warningType, warnRecordForType);
                }
                warnRecordForType[rowPrivateID] = warnStatements;
              });
            }
          });
        }
        resolve({
          data: sampleIdToMetadata,
          errorMessages,
          extraneousSampleIds,
          filename: file.name,
          hasUnknownFields,
          warningMessages,
        });
      },
    });
  });
}
