import Papa from "papaparse";
import {
  HEADERS_TO_METADATA_KEYS,
  METADATA_KEYS_TO_HEADERS,
  ParsedMetadata,
} from "../../../common/constants";
import {
  ERROR_CODE,
  Metadata,
  SampleIdToMetadata,
  WARNING_CODE,
} from "../../../common/types";
import { COUNTIES } from "../Table/components/Row/components/LocationField/COUNTIES";

export type SampleIdToWarningMessages = Record<string, Set<keyof Metadata>>;

export interface RowInfo {
  row: string[];
  rowIndex: number;
  errorMessages: Map<ERROR_CODE, Set<string>>;
  warningMessages: Map<WARNING_CODE, SampleIdToWarningMessages>;
  headers: string[] | null;
}

export interface ParseResult {
  data: SampleIdToMetadata;
  errorMessages: Map<ERROR_CODE, Set<string>>;
  filename: string;
  warningMessages: Map<WARNING_CODE, SampleIdToWarningMessages>;
}

export function parseFile(file: File): Promise<ParseResult> {
  return new Promise((resolve) => {
    Papa.parse(file, {
      complete: ({ data: rows }: Papa.ParseResult<string[]>) => {
        let headers = null;

        const sampleIdToMetadata: Record<string, Metadata> = {};
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

            sampleIdToMetadata[String(sampleId)] = metadata as Metadata;
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

function buildMetadata({ headers, row, warningMessages }: RowInfo) {
  const metadata = {} as ParsedMetadata;

  for (let i = 0; i < row.length; i++) {
    const value = row[i];

    // (thuang): If we detect the first column in a row is an example,
    // we skip parsing this row
    if (!headers || (i === 0 && Number.isNaN(Number(value)))) {
      break;
    }

    const key = HEADERS_TO_METADATA_KEYS[headers[i]];

    if (key) {
      metadata[key] = convertValue(key, value);
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

    const correctedKeys = new Set<keyof Metadata>();

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

  /**
   * (thuang): Reset county to "" if value is not on the list `COUNTIES`
   */
  if (
    metadata.collectionLocation &&
    !COUNTIES.includes(metadata.collectionLocation as string)
  ) {
    metadata.collectionLocation = "";
  }

  return metadata;
}

function convertValue(key: string, value: string) {
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
