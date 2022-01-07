import Papa from "papaparse";
import { StringToLocationFinder } from "src/common/utils/locationUtils";
import {
  EMPTY_METADATA,
  HEADERS_TO_METADATA_KEYS,
} from "../../../common/constants";
import {
  ERROR_CODE,
  Metadata,
  SampleIdToMetadata,
  WARNING_CODE,
} from "../../../common/types";

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
export type SampleIdToWarningMessages = Record<string, Set<keyof Metadata>>;
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
  rowMetadata: Metadata | null; // null if row can't be parsed
  // Below is an empty map if row has no warnings during parse
  rowWarnings: Map<WARNING_CODE, Set<keyof Metadata>>;
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
function getMissingHeaderFields(uploadedHeaders: string[]): Set<string> | null {
  const missingFields = new Set<string>();
  for (const [headerField, metadataKey] of Object.entries(
    HEADERS_TO_METADATA_KEYS
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

// For a single metadata, if auto-corrections needed, corrects and mutates in-place.
// If no corrections, returns null, otherwise returns which fields corrected.
function autocorrectMetadata(metadata: Metadata): Set<keyof Metadata> | null {
  const correctedKeys = new Set<keyof Metadata>();
  // If it has publicId or islAccessionNumber, it must be a public sample.
  if (metadata.publicId || metadata.islAccessionNumber) {
    // Ensure sample has been marked as public
    if (!metadata.submittedToGisaid) {
      metadata.submittedToGisaid = true;
      correctedKeys.add("submittedToGisaid");
    }
    // Ensure sample is not private, since it has been submitted publicly
    if (metadata.keepPrivate) {
      metadata.keepPrivate = false;
      correctedKeys.add("keepPrivate");
    }
  }

  return correctedKeys.size ? correctedKeys : null;
}

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
function warnMissingMetadata(metadata: Metadata): Set<keyof Metadata> | null {
  const missingMetadata = new Set<keyof Metadata>();
  const ALWAYS_REQUIRED: Array<keyof Metadata> = [
    "collectionDate",
    "collectionLocation",
  ];
  ALWAYS_REQUIRED.forEach((keyRequiredMetadata) => {
    if (!metadata[keyRequiredMetadata]) {
      missingMetadata.add(keyRequiredMetadata);
    }
  });
  // Additionally, if it's marked as public, then `publicId` is required
  if (metadata.submittedToGisaid && !metadata.publicId) {
    missingMetadata.add("publicId");
  }
  return missingMetadata.size ? missingMetadata : null;
}

/**
 * Parses a single data row. If issues during parse, also reports warnings.
 *
 * Args:
 *   - row: Data row /after/ ingestion by Papa.parse, not the raw text row.
 *       Row needs to be brought in as an object with data matched to keys.
 *   - stringToLocationFinder: Function that converts user-provided string of
 *       a location to closest matching internally used Location object.
 *   - VOODOO the filtering for extraneous IDs will have an arg.
 *
 * In some cases, the row can not or should not be parsed -- eg if malformed
 * or data is considered extraneous -- in that case, returned object will have
 * `rowMetadata` set to `null` to indicate to caller to ignore the row's info.
 */
function parseRow(
  row: Record<string, string>,
  stringToLocationFinder: StringToLocationFinder
): ParsedRow {
  const rowWarnings: ParsedRow["rowWarnings"] = new Map();
  // If row has no sampleId, we can't tie it to a sample, so we drop it.
  // VOODOO TODO also drop the specific cases of EXAMPLE rows
  if (!row.sampleId) {
    return {
      rowMetadata: null, // Indicates to caller row had nothing to parse.
      rowWarnings,
    };
  }

  const rowMetadata: Metadata = {
    // Ensure that rowMetadata will be sane even if row has no values
    ...EMPTY_METADATA,
  };

  // Only extract info we care about from the row. Set `rowMetadata` with it.
  METADATA_KEYS_TO_EXTRACT.forEach((key) => {
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
      } else if (key === "keepPrivate" || key === "submittedToGisaid") {
        rowMetadata[key] = convertYesNoToBool(originalValue);
      } else {
        rowMetadata[key] = originalValue;
      }
    }
  });

  // autocorrectMetadata mutates metadata in-place if corrections needed
  const rowAutocorrectWarnings = autocorrectMetadata(rowMetadata);
  if (rowAutocorrectWarnings) {
    rowWarnings.set(WARNING_CODE.AUTO_CORRECT, rowAutocorrectWarnings);
  }

  const rowMissingMetadataWarnings = warnMissingMetadata(rowMetadata);
  if (rowMissingMetadataWarnings) {
    rowWarnings.set(WARNING_CODE.MISSING_DATA, rowMissingMetadataWarnings);
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

        const missingHeaderFields = getMissingHeaderFields(uploadedHeaders);
        if (missingHeaderFields) {
          errorMessages.set(ERROR_CODE.MISSING_FIELD, missingHeaderFields);
        }

        rows.forEach((row) => {
          const { rowMetadata, rowWarnings } = parseRow(
            row,
            stringToLocationFinder
          );
          // If false-y, there was no parse result, so we just skip those
          if (rowMetadata) {
            // We can guarantee there is a sampleId because rowMetadata exists
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
