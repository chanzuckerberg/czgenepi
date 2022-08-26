import { isEmpty } from "lodash";
import {
  ParseResult as ParseResultEdit,
  SampleIdToWarningMessages as SampleIdToWarningMessagesEdit,
} from "src/common/components/library/data_subview/components/EditSamplesConfirmationModal/components/ImportFile/parseFile";
import { WebformTableTypeOptions as MetadataUploadTypeOption } from "src/components/WebformTable";
import { ERROR_CODE } from "src/components/WebformTable/common/types";
import Error from "src/views/Upload/components/Metadata/components/ImportFile/components/Alerts/Error";
import Success from "src/views/Upload/components/Metadata/components/ImportFile/components/Alerts/Success";
import {
  ErrorBadFormatData,
  WarningAbsentSample,
  WarningAbsentSampleEdit,
  WarningAutoCorrect,
  WarningExtraneousEntry,
  WarningExtraneousEntrySampleEdit,
  WarningMissingData,
  WarningMissingDataEdit,
} from "src/views/Upload/components/Metadata/components/ImportFile/components/Alerts/warnings";
import {
  ParseResult as ParseResultUpload,
  SampleIdToWarningMessages,
  SampleIdToWarningMessages as SampleIdToWarningMessagesUpload,
} from "src/views/Upload/components/Metadata/components/ImportFile/parseFile";
import { DuplicateIdsError } from "./components/DuplicateIdsError";
import {
  badLocationFormatSamples,
  WarningBadLocationFormat,
} from "./components/WarningBadLocationFormat";
import { WarningUnknownDataFields } from "./components/WarningUnknownDataFields";

interface ImportFileWarningsProps {
  hasImportedFile: boolean;
  extraneousSampleIds: string[];
  parseResult: ParseResultEdit | ParseResultUpload | null;
  filename: string;
  missingFields: string[] | null;
  autocorrectCount: number;
  absentSampleIds: string[];
  // TODO: make these not optional when errors are added to sample Upload flow
  duplicatePrivateIds?: string[] | null;
  duplicatePublicIds?: string[] | null;
  badLocationFormatSamples?: badLocationFormatSamples;
  hasUnknownDataFields?: boolean;
  missingData: SampleIdToWarningMessagesUpload | SampleIdToWarningMessagesEdit;
  badFormatData:
    | SampleIdToWarningMessagesUpload
    | SampleIdToWarningMessagesEdit;
  IdColumnNameForWarnings: string;
  metadataUploadType:
    | MetadataUploadTypeOption.Upload
    | MetadataUploadTypeOption.Edit;
}

export default function ImportFileWarnings({
  hasImportedFile,
  extraneousSampleIds,
  parseResult,
  filename,
  missingFields,
  autocorrectCount,
  absentSampleIds,
  duplicatePrivateIds,
  duplicatePublicIds,
  badLocationFormatSamples,
  hasUnknownDataFields,
  missingData,
  badFormatData,
  IdColumnNameForWarnings,
  metadataUploadType,
}: ImportFileWarningsProps): JSX.Element {
  return (
    <>
      {hasImportedFile &&
        filename !== "" &&
        !getIsParseResultCompletelyUnused(extraneousSampleIds, parseResult) && (
          <Success filename={filename} />
        )}

      {missingFields && (
        <Error errorCode={ERROR_CODE.MISSING_FIELD} names={missingFields} />
      )}

      {!isEmpty(badFormatData) && (
        <ErrorBadFormatData
          badFormatData={badFormatData}
          IdColumnNameForWarnings={IdColumnNameForWarnings}
        />
      )}

      {autocorrectCount > 0 && (
        <WarningAutoCorrect autocorrectedSamplesCount={autocorrectCount} />
      )}

      {metadataUploadType == MetadataUploadTypeOption.Edit &&
        extraneousSampleIds.length > 0 && (
          <WarningExtraneousEntrySampleEdit
            extraneousSampleIds={extraneousSampleIds}
          />
        )}
      {metadataUploadType == MetadataUploadTypeOption.Upload &&
        extraneousSampleIds.length > 0 && (
          <WarningExtraneousEntry extraneousSampleIds={extraneousSampleIds} />
        )}

      {metadataUploadType == MetadataUploadTypeOption.Edit &&
        !isEmpty(absentSampleIds) && (
          <WarningAbsentSampleEdit absentSampleIds={absentSampleIds} />
        )}

      {metadataUploadType == MetadataUploadTypeOption.Upload &&
        !isEmpty(absentSampleIds) && (
          <WarningAbsentSample absentSampleIds={absentSampleIds} />
        )}

      {metadataUploadType == MetadataUploadTypeOption.Upload &&
        !isEmpty(missingData) && (
          <WarningMissingData missingData={missingData} />
        )}

      {metadataUploadType == MetadataUploadTypeOption.Edit &&
        !isEmpty(missingData) && (
          <WarningMissingDataEdit missingData={missingData} />
        )}

      {(!isEmpty(duplicatePublicIds) || !isEmpty(duplicatePrivateIds)) && (
        <DuplicateIdsError
          duplicatePrivateIds={duplicatePrivateIds}
          duplicatePublicIds={duplicatePublicIds}
        />
      )}
      {badLocationFormatSamples && (
        <WarningBadLocationFormat badSamples={badLocationFormatSamples} />
      )}
      {hasUnknownDataFields && <WarningUnknownDataFields />}
    </>
  );
}

function getIsParseResultCompletelyUnused(
  extraneousSampleIds: string[],
  parseResult: ParseResultUpload | ParseResultEdit | null
) {
  if (!parseResult) return true;

  const { data } = parseResult;

  return extraneousSampleIds.length === Object.keys(data).length;
}

export function getAutocorrectCount(
  sampleIdToWarningMessages: SampleIdToWarningMessages = {}
) {
  return Object.keys(sampleIdToWarningMessages).length;
}

// Returns array of all missing column header fields, or if none missing, null.
export function getMissingFields(
  parseResult: ParseResultUpload | ParseResultEdit
): string[] | null {
  const { errorMessages } = parseResult;
  const missingFieldsErr = errorMessages.get(ERROR_CODE.MISSING_FIELD);
  return missingFieldsErr ? Array.from(missingFieldsErr) : null;
}

export function getDuplicatePublicIds(
  parseResult: ParseResultUpload | ParseResultEdit
): string[] | null {
  const { errorMessages } = parseResult;
  const dupPublicIds = errorMessages.get(ERROR_CODE.DUPLICATE_PUBLIC_IDS);
  return dupPublicIds ? Array.from(dupPublicIds) : null;
}

export function getDuplicatePrivateIds(
  parseResult: ParseResultUpload | ParseResultEdit
): string[] | null {
  const { errorMessages } = parseResult;
  const dupPrivateIds = errorMessages.get(ERROR_CODE.DUPLICATE_PRIVATE_IDS);
  return dupPrivateIds ? Array.from(dupPrivateIds) : null;
}
