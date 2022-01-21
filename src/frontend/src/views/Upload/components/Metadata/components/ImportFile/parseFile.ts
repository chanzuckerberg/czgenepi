import Papa from "papaparse";
import {
  HEADERS_TO_METADATA_KEYS,
  METADATA_KEYS_TO_HEADERS,
} from "../../../common/constants";
import {
  ERROR_CODE,
  ParsedMetadata,
  SampleIdToParsedMetadata,
  WARNING_CODE,
} from "../../../common/types";

export type SampleIdToWarningMessages = Record<
  string,
  Set<keyof ParsedMetadata>
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

export function parseFile(file: File): Promise<ParseResult> {
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
  if (metadata.publicId) {
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
