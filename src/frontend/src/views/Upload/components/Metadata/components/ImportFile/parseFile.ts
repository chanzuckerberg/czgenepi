import { Dictionary } from "lodash";
import Papa from "papaparse";
import { StringToLocationFinder } from "src/common/utils/locationUtils";
import { DATE_REGEX } from "src/components/DateField/constants";
import {
  SampleEditTsvMetadata,
  SampleUploadTsvMetadata,
} from "src/components/DownloadMetadataTemplate/common/types";
import { EXAMPLE_SAMPLE_IDS } from "src/components/DownloadMetadataTemplate/prepMetadataTemplate";
import {
  ERROR_CODE,
  SampleIdToMetadata,
  WARNING_CODE,
} from "src/components/WebformTable/common/types";
import {
  EMPTY_METADATA,
  FORBIDDEN_NAME_CHARACTERS_REGEX,
  HEADERS_TO_METADATA_KEYS,
  MAX_NAME_LENGTH,
} from "../../../common/constants";
/**
 * (Vince) Regarding interfaces for Warnings/Errors:
 * The naming below makes our warnings and errors sound very generalized, but
 * they are not particularly general. The interface implementation is closely
 * tied to the very few warning/errors we currently generate and the specific
 * React component needs of displaying them to the user. If at some point we
 * need a warning/error that won't fit into the below structure, feel free to
 * completely re-write how these types work and strive to design it in a way
 * that would make it easy to add new interfaces for future warnings/errors.
 *
 * WarningMessages are tied to a category (WARNING_CODE) of warning, then
 * further broken into which sample has that kind of warning and a record
 * of what keys within that sample triggered the warning.
 *
 * ErrorMessages are also tied to a category (ERROR_CODE) of error, but have a
 * wider scope. They are not tied to any specific sample, they are just the
 * messages that should be passed on to the user regarding the error category.
 */
export type SampleIdToWarningMessages = Record<
  string,
  Set<keyof SampleUploadTsvMetadata>
>;

type WarningMessages = Map<WARNING_CODE, SampleIdToWarningMessages>;
type ErrorMessages = Map<ERROR_CODE, Set<string>>;

// End result of parsing upload. What goes back out to wider app to use.
export interface ParseResult {
  data: SampleIdToMetadata;
  errorMessages: ErrorMessages;
  warningMessages: WarningMessages;
  filename: string;
}

// Result of parsing a single (non-header) row from uploaded metadata file
interface ParsedRow {
  rowMetadata: SampleUploadTsvMetadata | null; // null if row can't be parsed
  // Below is an empty map if row has no warnings during parse
  rowWarnings: Map<WARNING_CODE, Set<keyof SampleUploadTsvMetadata>>;
  // Note that we don't currently have any breaking errors at row parse level
}

// Helper -- Takes column header from file, converts to internal metadata key
// If header is unrecognized, leaves it alone (useful for warnings, etc).
function convertHeaderToMetadataKey(headerName: string): string {
  return HEADERS_TO_METADATA_KEYS[headerName] || headerName;
}

// Helper -- Returns any missing col header field names based on what header
// specified for the metadata keys. If nothing missing, returns null.
// Note: the signature here is a little surprising. It's the metadata keys
// **after** PapaParse has parse-converted the header fields into keys.
export function getMissingHeaderFields(
  uploadedHeaders: string[],
  headersToMetadataKeys: Dictionary<
    keyof SampleEditTsvMetadata | keyof SampleUploadTsvMetadata
  >
): Set<string> | null {
  const missingFields = new Set<string>();
  for (const [headerField, metadataKey] of Object.entries(
    headersToMetadataKeys
  )) {
    if (!uploadedHeaders.includes(metadataKey)) {
      missingFields.add(headerField);
    }
  }
  return missingFields.size !== 0 ? missingFields : null;
}

// Helper -- Upload uses YES/NO to represent booleans for some columns
function convertYesNoToBool(value: string): boolean {
  return value.toUpperCase() === "YES";
}

// We use the values of HEADERS_TO_METADATA_KEYS to future proof in case
// it drifts from flipped METADATA_KEYS_TO_HEADERS due to later changes.
const METADATA_KEYS_TO_EXTRACT = Object.values(HEADERS_TO_METADATA_KEYS);

/**
 * Produce warnings for missing required metadata. If none, return null.
 *
 * Sadly, this function is basically duplicating the `yup` `validationSchema`
 * for a Row's Metadata elsewhere in the app. However, from experimenting a
 * bit and looking on Stack Overflow, it doesn't look like there is a great way
 * to extract that validation logic into a general requirement parsing step:
 *  https://stackoverflow.com/q/64440400
 * So we're just duplicating that aspect here.
 */
function warnMissingMetadata(
  metadata: SampleUploadTsvMetadata
): Set<keyof SampleUploadTsvMetadata> | null {
  const missingMetadata = new Set<keyof SampleUploadTsvMetadata>();
  const ALWAYS_REQUIRED: Array<keyof SampleUploadTsvMetadata> = [
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

/**
 * Warn about metadata that is improperly formatted. If none, return null.
 *
 * Note that we only warn about bad formatting when the data is present.
 * If the data is simply missing / empty string, that's handled elsewhere.
 *
 * Sadly, like the above warnMissingMetadata, this function is partially
 * duplicating the `yup` `validationSchema` for a Row's Metadata elsewhere
 * in the app. But there's no great way to abstract that out, so here we are.
 */
function warnBadFormatMetadata(
  metadata: SampleUploadTsvMetadata
): Set<keyof SampleUploadTsvMetadata> | null {
  const badFormatMetadata = new Set<keyof SampleUploadTsvMetadata>();

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

export function inferMetadata(
  row: Record<string, string>,
  key: keyof (SampleUploadTsvMetadata & SampleEditTsvMetadata),
  rowMetadata: SampleUploadTsvMetadata & SampleEditTsvMetadata,
  stringToLocationFinder: {
    (locationString: string): NamedGisaidLocation | undefined;
  }
): void {
  const originalValue: string | undefined = row[key];
  // Only overwrite sane defaults if a "real" value was pulled for key
  if (originalValue) {
    // Depending on the key being extracted, we handle it differently.
    if (key === "collectionLocation") {
      // Incoming `collectionLocation` is a string, but the app uses objects
      // to represent location, so we convert before folding it in.
      let parsedCollectionLocation = undefined;
      // If they didn't enter enough, ignore as typo, leave as undefined
      if (originalValue.length > 2) {
        parsedCollectionLocation = stringToLocationFinder(originalValue);
      }
      rowMetadata.collectionLocation = parsedCollectionLocation;
    } else if (key === "keepPrivate") {
      rowMetadata[key] = convertYesNoToBool(originalValue);
    } else {
      rowMetadata[key] = originalValue;
    }
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
): ParsedRow {
  const rowWarnings: ParsedRow["rowWarnings"] = new Map();
  // If row has no sampleId, we can't tie it to a sample, so we drop it.
  // Some sampleIds (ie, ones for examples) also signal we should ignore row.
  if (!row.sampleId || ignoredSampleIds.has(row.sampleId)) {
    return {
      rowMetadata: null, // Indicates to caller row had nothing to parse.
      rowWarnings,
    };
  }

  const rowMetadata: SampleUploadTsvMetadata = {
    // Ensure that rowMetadata will be sane even if row has no values
    ...EMPTY_METADATA,
  };

  // Only extract info we care about from the row. Set `rowMetadata` with it.
  METADATA_KEYS_TO_EXTRACT.forEach((key) => {
    inferMetadata(row, key, rowMetadata, stringToLocationFinder);
  });
  const rowMissingMetadataWarnings = warnMissingMetadata(rowMetadata);
  if (rowMissingMetadataWarnings) {
    rowWarnings.set(WARNING_CODE.MISSING_DATA, rowMissingMetadataWarnings);
  }
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
export function parseFile(
  file: File,
  stringToLocationFinder: StringToLocationFinder
): Promise<ParseResult> {
  return new Promise((resolve) => {
    Papa.parse(file, {
      header: true, // Imported file starts with a header row
      // We parse the column headers to their corresponding metadata keys
      transformHeader: convertHeaderToMetadataKey,
      // Because file parsing is async, we need to use callback on `complete`
      complete: ({
        data: rows,
        meta: papaParseMeta,
      }: Papa.ParseResult<Record<string, string>>) => {
        const uploadedHeaders = papaParseMeta.fields as string[]; // available b/c `header: true`

        // Init -- Will modify these in place as we work through incoming rows.
        const sampleIdToMetadata: SampleIdToMetadata = {};
        const errorMessages = new Map<ERROR_CODE, Set<string>>();
        const warningMessages = new Map<
          WARNING_CODE,
          SampleIdToWarningMessages
        >();

        const missingHeaderFields = getMissingHeaderFields(
          uploadedHeaders,
          HEADERS_TO_METADATA_KEYS
        );
        if (missingHeaderFields) {
          errorMessages.set(ERROR_CODE.MISSING_FIELD, missingHeaderFields);
        } else {
          // We only ingest file's data if user had all expected fields.
          const IGNORED_SAMPLE_IDS = new Set(EXAMPLE_SAMPLE_IDS);
          rows.forEach((row) => {
            const { rowMetadata, rowWarnings } = parseRow(
              row,
              stringToLocationFinder,
              IGNORED_SAMPLE_IDS
            );
            // If false-y, there was no parse result, so we just skip those
            if (rowMetadata) {
              // We can guarantee there's a sampleId because rowMetadata exists
              // and parsing requires it, so `as string` is always correct here
              const rowSampleId = rowMetadata.sampleId as string;
              sampleIdToMetadata[rowSampleId] = rowMetadata;
              // If row had warnings, fold them into the overall warnings.
              // If row had no warnings, forEach is a no-op since no entries.
              rowWarnings.forEach((warnStatements, warningType) => {
                let warnRecordForType = warningMessages.get(warningType);
                if (warnRecordForType === undefined) {
                  // Haven't encountered this warning type until now, do init
                  warnRecordForType = {};
                  warningMessages.set(warningType, warnRecordForType);
                }
                warnRecordForType[rowSampleId] = warnStatements;
              });
            }
          });
        }

        resolve({
          data: sampleIdToMetadata,
          errorMessages,
          warningMessages,
          filename: file.name,
        });
      },
    });
  });
}
