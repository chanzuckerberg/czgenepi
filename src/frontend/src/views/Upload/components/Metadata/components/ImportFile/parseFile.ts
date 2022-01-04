import Papa from "papaparse";
import {
  HEADERS_TO_METADATA_KEYS,
  METADATA_KEYS_TO_HEADERS,
  EMPTY_METADATA,
} from "../../../common/constants";
import {
  ERROR_CODE,
  Metadata,
  ParsedMetadata,
  SampleIdToParsedMetadata,
  WARNING_CODE,
} from "../../../common/types";
import { StringToLocationFinder } from "src/common/utils/locationUtils";

export type SampleIdToWarningMessages = Record<
  string,
  Set<keyof ParsedMetadata>
>;

// VOODOO This is an Indy-style swap as part of the refactor
// NOTE docme this is pretty badly tied to a certain kind of warning
// Explain that this really is not as general as it sounds. I know, I wish
// I could fix it, but lord this is taking forever.
// Also, while we're at it, point out the same goes for error messages...
type VoodooSampleIdToWarningMessages = Record<
  string,
  Set<keyof Metadata>
>;

export interface RowInfo {
  row: string[];
  rowIndex: number;
  errorMessages: Map<ERROR_CODE, Set<string>>;
  warningMessages: Map<WARNING_CODE, SampleIdToWarningMessages>;
  headers: string[] | null;
}

export interface ParseResult {
  data: SampleIdToParsedMetadata;
  errorMessages: Map<ERROR_CODE, Set<string>>;
  filename: string;
  warningMessages: Map<WARNING_CODE, SampleIdToWarningMessages>;
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
  for (const [headerField, metadataKey] of Object.entries(HEADERS_TO_METADATA_KEYS)) {
    if (!uploadedHeaders.includes(metadataKey)) {
      missingFields.add(headerField);
    }
  }
  return missingFields.size !== 0 ? missingFields : null;
}

// Helper -- Upload uses YES/NO to represent booleans for some columns
function convertYesNoToBool(value: string): boolean {
  return (value.toUpperCase() === "YES");
}

// We use the values of HEADERS_TO_METADATA_KEYS because we need to extract
// `locationString` from upload, which is a transitory metadata key.
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
 * VOODOO_TODO__DOC_ME
 */
function parseRow(
  row: Record<string, string>,
  stringToLocationFinder: StringToLocationFinder,
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
      // `locationString` is a transitory key, only used as a way to look up
      // the appropriate Location for "real" Metadata of `collectionLocation`.
      if (key === "locationString") {
        let collectionLocation = undefined;
        // If they didn't enter enough, ignore as typo, fallback to undefined
        if (originalValue.length > 2) {
          collectionLocation = stringToLocationFinder(originalValue);
        }
        rowMetadata.collectionLocation = collectionLocation;
      } else if(key === "keepPrivate" || key === "submittedToGisaid" ) {
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
 * VOODOO_TODO__DOC_ME
 * TODO for easy dev, just console log results at end. Need to hook up next.
 * Notes
 * - Parses all row entries, doesn't care about filtering them here, caller should
 */
function voodooFileParser(
  file: File,
  stringToLocationFinder: StringToLocationFinder
  ): void {
  Papa.parse(file, {
    header: true, // Imported file starts with a header row
    // We parse the column headers to their corresponding metadata keys
    transformHeader: convertHeaderToMetadataKey,
    // Because file parsing is async, we need to use callback on `complete`
    complete: ({data: rows, meta: papaParseMeta}: Papa.ParseResult<Record<string, string>>) => {
      const uploadedHeaders = papaParseMeta.fields as string[]; // available b/c `header: true`
      console.log("rows", rows); // REMOVE
      console.log("papaParseMeta", papaParseMeta); // REMOVE

      // Init -- Will modify these in place as we work through incoming rows.
      const sampleIdToMetadata: Record<string, Metadata> = {};
      const errorMessages = new Map<ERROR_CODE, Set<string>>();
      const warningMessages = new Map<
        WARNING_CODE,
        VoodooSampleIdToWarningMessages
      >();

      const missingHeaderFields = getMissingHeaderFields(uploadedHeaders);
      if (missingHeaderFields) {
        errorMessages.set(ERROR_CODE.MISSING_FIELD, missingHeaderFields);
      }

      rows.forEach((row) => {
        const { rowMetadata, rowWarnings } = parseRow(row, stringToLocationFinder);
        if (rowMetadata) { // If false-y, there was no parse result, skip it
          // We can guarantee there is a sampleId because rowMetadata exists
          // and parsing requires it, so `as string` is always true here
          const rowSampleId = rowMetadata.sampleId as string;
          sampleIdToMetadata[rowSampleId] = rowMetadata;
          // If row had warnings, fold them into the overall warnings.
          // If row had no warnings, forEach is a no-op since no entries.
          rowWarnings.forEach((warnStatements, warningType) => {
            const warningCategory = warningMessages.get(warningType) || {};
            warningCategory[rowSampleId] = warnStatements;
          });
        }
      });

      // VOODOO this is where a `resolve` "return" should happen
      // Instead, for quick check, just logging out right now
      console.log("sampleIdToMetadata", sampleIdToMetadata); // REMOVE
      console.log("errorMessages", errorMessages); // REMOVE
      console.log("warningMessages", warningMessages); // REMOVE
    },
  });
}

export function parseFile(
  file: File,
  stringToLocationFinder: StringToLocationFinder
): Promise<ParseResult> {
  // VOODOO REMOVE papaparse playground

  voodooFileParser(file, stringToLocationFinder);

  // END VOODOO
  return new Promise((resolve) => {
    Papa.parse(file, {
      complete: ({ data: rows }: Papa.ParseResult<string[]>) => {
        let headers = null;

        const sampleIdToMetadata: Record<string, ParsedMetadata> = {};
        const errorMessages = new Map<ERROR_CODE, Set<string>>();
        const warningMessages = new Map<
          WARNING_CODE,
          SampleIdToWarningMessages
        >();

        for (let i = 0; i < rows.length; i++) {
          const row = rows[i];

          if (i === 0) {
            headers = row;
            continue;
          }

          const metadata = buildMetadata({
            errorMessages,
            headers,
            row,
            rowIndex: i,
            warningMessages,
          });

          const sampleId = metadata.sampleId;

          if (sampleId) {
            delete metadata.sampleId;

            sampleIdToMetadata[String(sampleId)] = metadata as ParsedMetadata;
          }
        }

        CheckHeaderMissingFields(headers, errorMessages);

        resolve({
          data: sampleIdToMetadata,
          errorMessages,
          filename: file.name,
          warningMessages,
        });
      },
    });
  });
}

/**
 * Creates the metadata for a sample from its corresponding row in file.
 *
 * This relies on first column implicitly being the "sample's position" in fasta upload.
 * The TSV template has the first column header as simply being "" (empty string),
 * but the value for that column in each data row of downloaded TSV template is either
 * "example X" (for the example rows placed at top of template) or "1", "2", etc for the
 * actual samples. I (Vince) couldn't find any documentation on this, but it seems to be
 * the intent after doing some observation.
 *
 * Below, the way we determine if a given row is "real" data or a throw-away example row
 * is by checking that first column and seeing if it's a number. If it's not a number, we
 * assume that it's an example row (because "example A" etc will parse as NaN). This is kind
 * of troubling, since the implicit first column is not actually one of the necessary pieces
 * of metadata -- in theory it could be dropped entirely and the user would still be sending
 * everything we need. But because the implementation relies on it, would take some work.
 */
function buildMetadata({ headers, row, warningMessages }: RowInfo) {
  let metadata: ParsedMetadata = {};

  for (let i = 0; i < row.length; i++) {
    const value = row[i];

    // (thuang): If we detect the first column in a row is an example,
    // we skip parsing this row
    // FIXME (Vince): Want to determine if it's a "real" data row some other way
    // see the documentation above function for more background.
    if (!headers || (i === 0 && Number.isNaN(Number(value)))) {
      break;
    }

    const key = HEADERS_TO_METADATA_KEYS[headers[i]];

    if (key) {
      metadata = {
        ...metadata,
        [key]: convertValue(key, value),
      };
    }
  }

  return autocorrect(metadata, warningMessages);
}

function autocorrect(
  metadata: ParsedMetadata,
  warningMessages: ParseResult["warningMessages"]
) {
  /**
   * (thuang): Set `submittedToGisaid` to `true`, if related optional
   * fields are present
   */
  if (metadata.publicId || metadata.islAccessionNumber) {
    const sampleIdToCorrectedKeys =
      warningMessages.get(WARNING_CODE.AUTO_CORRECT) || {};

    const correctedKeys = new Set<keyof ParsedMetadata>();

    if (!metadata.submittedToGisaid) {
      metadata.submittedToGisaid = true;
      correctedKeys.add("submittedToGisaid");
    }

    if (metadata.keepPrivate) {
      metadata.keepPrivate = false;
      correctedKeys.add("keepPrivate");
    }

    if (correctedKeys.size) {
      sampleIdToCorrectedKeys[metadata.sampleId as string] = correctedKeys;
    }

    warningMessages.set(WARNING_CODE.AUTO_CORRECT, sampleIdToCorrectedKeys);
  }

  return metadata;
}

function convertValue(key: string, value: string): string | boolean {
  if (key === "keepPrivate" || key === "submittedToGisaid") {
    if (value.toUpperCase() === "YES") return true;
    return false;
  }
  return value;
}

function CheckHeaderMissingFields(
  headers: string[] | null,
  errorMessages: Map<ERROR_CODE, Set<string>>
) {
  const missingFields = new Set<string>();

  for (const expectedHeader of Object.values(METADATA_KEYS_TO_HEADERS)) {
    if (!headers?.includes(expectedHeader)) {
      missingFields.add(expectedHeader);
    }
  }

  if (missingFields.size) {
    errorMessages.set(ERROR_CODE.MISSING_FIELD, missingFields);
  }
}
