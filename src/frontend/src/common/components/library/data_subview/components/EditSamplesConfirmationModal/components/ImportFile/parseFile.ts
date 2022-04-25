import { pick } from "lodash";
import Papa from "papaparse";
import { HEADERS_TO_SAMPLE_EDIT_METADATA_KEYS } from "src/common/components/library/data_subview/components/EditSamplesConfirmationModal/components/common/constants";
import { StringToLocationFinder } from "src/common/utils/locationUtils";
import { DATE_REGEX } from "src/components/DateField/constants";
import { SampleEditTsvMetadata } from "src/components/DownloadMetadataTemplate/common/types";
import { EXAMPLE_CURRENT_PRIVATE_IDENTIFIERS } from "src/components/DownloadMetadataTemplate/prepMetadataTemplate";
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
  getMissingHeaderFields,
  inferMetadata,
} from "src/views/Upload/components/Metadata/components/ImportFile/parseFile";

type MergedSampleEditTsvWebformMetadata = SampleEditTsvMetadata &
  SampleEditMetadataWebform;

export type SampleIdToWarningMessages = Record<
  string,
  Set<keyof SampleEditMetadataWebform>
>;

type WarningMessages = Map<WARNING_CODE, SampleIdToWarningMessages>;
type ErrorMessages = Map<ERROR_CODE, Set<string>>;

export interface ParseResult {
  data: SampleIdToEditMetadataWebform;
  errorMessages: ErrorMessages;
  warningMessages: WarningMessages;
  filename: string;
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

const SAMPLE_EDIT_METADATA_KEYS_TO_EXTRACT = Object.values(
  HEADERS_TO_SAMPLE_EDIT_METADATA_KEYS
);

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
  // Only extract info we care about from the row. Set `rowMetadata` with it.
  SAMPLE_EDIT_METADATA_KEYS_TO_EXTRACT.forEach((key) => {
    inferMetadata(row, key, rowMetadata, stringToLocationFinder);
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

function convertHeaderToMetadataKey(headerName: string): string {
  return HEADERS_TO_SAMPLE_EDIT_METADATA_KEYS[headerName] || headerName;
}

export function parseFileEdit(
  file: File,
  stringToLocationFinder: StringToLocationFinder
): Promise<ParseResult> {
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
        const errorMessages = new Map<ERROR_CODE, Set<string>>();
        const warningMessages = new Map<
          WARNING_CODE,
          SampleIdToWarningMessages
        >();
        const missingHeaderFields = getMissingHeaderFields(
          uploadedHeaders,
          HEADERS_TO_SAMPLE_EDIT_METADATA_KEYS
        );
        if (missingHeaderFields) {
          errorMessages.set(ERROR_CODE.MISSING_FIELD, missingHeaderFields);
        } else {
          // We only ingest file's data if user had all expected fields.
          const IGNORED_SAMPLE_IDS = new Set(
            EXAMPLE_CURRENT_PRIVATE_IDENTIFIERS
          );
          rows.forEach((row) => {
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
                Object.keys(SAMPLE_EDIT_WEBFORM_METADATA_KEYS_TO_HEADERS)
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
          warningMessages,
          filename: file.name,
        });
      },
    });
  });
}
