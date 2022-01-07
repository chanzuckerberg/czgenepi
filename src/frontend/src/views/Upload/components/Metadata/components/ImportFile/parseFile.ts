import Papa from "papaparse";
import {
  HEADERS_TO_METADATA_KEYS,
  EMPTY_METADATA,
} from "../../../common/constants";
import {
  ERROR_CODE,
  Metadata,
  SampleIdToMetadata,
  WARNING_CODE,
} from "../../../common/types";
import { StringToLocationFinder } from "src/common/utils/locationUtils";

// NOTE VOODOO docme this is pretty badly tied to a certain kind of warning
// Explain that this really is not as general as it sounds. I know, I wish
// I could fix it, but lord this is taking forever.
// Also, while we're at it, point out the same goes for error messages...
export type SampleIdToWarningMessages = Record<
  string,
  Set<keyof Metadata>
>;

// End result of parsing upload. What goes back out to wider app to use.
export interface ParseResult {
  data: SampleIdToMetadata;
  errorMessages: Map<ERROR_CODE, Set<string>>;
  warningMessages: Map<WARNING_CODE, SampleIdToWarningMessages>;
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
      if (key === "collectionLocation") {
        // Incoming `collectionLocation` is a string, but the app uses objects
        // to represent location, so we convert before folding it in.
        let parsedCollectionLocation = undefined;
        // If they didn't enter enough, ignore as typo, leave as undefined
        if (originalValue.length > 2) {
          parsedCollectionLocation = stringToLocationFinder(originalValue);
        }
        rowMetadata.collectionLocation = parsedCollectionLocation;
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
 * Notes
 * - Parses all row entries, doesn't care about filtering them here, caller should
 *    ^^ mostly true, but will be a lie once we filter out example rows
 *       also should mention how would be more elegant to pass samples down here,
 *       but would mess up warnings as implemented.
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
      complete: ({data: rows, meta: papaParseMeta}: Papa.ParseResult<Record<string, string>>) => {
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
          const { rowMetadata, rowWarnings } = parseRow(row, stringToLocationFinder);
          if (rowMetadata) { // If false-y, there was no parse result, skip it
            // We can guarantee there is a sampleId because rowMetadata exists
            // and parsing requires it, so `as string` is always true here
            const rowSampleId = rowMetadata.sampleId as string;
            sampleIdToMetadata[rowSampleId] = rowMetadata;
            // If row had warnings, fold them into the overall warnings.
            // If row had no warnings, forEach is a no-op since no entries.
            rowWarnings.forEach((warnStatements, warningType) => {
              let warnRecordForType = warningMessages.get(warningType);
              if (warnRecordForType === undefined) {
                // Haven't encountered this warning type until now, do init
                warnRecordForType = {};
                warningMessages.set(warningType, warnRecordForType)
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
