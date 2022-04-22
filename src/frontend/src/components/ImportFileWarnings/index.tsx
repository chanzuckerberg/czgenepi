import { isEmpty } from "lodash";
import React from "react";
import { ErrorsAndWarnings } from "src/common/components/library/data_subview/components/EditSamplesConfirmationModal/components/ErrorsAndWarnings";
import {
  ParseResult as ParseResultEdit,
  SampleIdToWarningMessages as SampleIdToWarningMessagesEdit,
} from "src/common/components/library/data_subview/components/EditSamplesConfirmationModal/components/ImportFile/parseFile";
import { WebformTableTypeOptions as MetadataUploadTypeOption } from "src/components/WebformTable";
import { ERROR_CODE } from "src/components/WebformTable/common/types";
import Error from "src/views/Upload/components/Metadata/components/ImportFile/components/Alerts/Error";
import Success from "src/views/Upload/components/Metadata/components/ImportFile/components/Alerts/Success";
import { DuplicateIdsError } from "./components/DuplicateIdsError";
import { BadLocationFormatProps, badLocationFormatSamples, WarningBadLocationFormat } from "./components/WarningBadLocationFormat";
import { WarningUnknownDataFields } from "./components/WarningUnknownDataFields";
import {
  ErrorBadFormatData,
  WarningAbsentSample,
  WarningAutoCorrect,
  WarningExtraneousEntry,
  WarningExtraneousEntrySampleEdit,
  WarningMissingData,
} from "src/views/Upload/components/Metadata/components/ImportFile/components/Alerts/warnings";
import {
  ParseResult,
  ParseResult as ParseResultUpload,
  SampleIdToWarningMessages,
  SampleIdToWarningMessages as SampleIdToWarningMessagesUpload,
} from "src/views/Upload/components/Metadata/components/ImportFile/parseFile";

interface ImportFileWarningsProps {
  hasImportedFile: boolean;
  extraneousSampleIds: string[];
  parseResult: ParseResultEdit | ParseResultUpload | null;
  filename: string;
  missingFields: string[] | null;
  autocorrectCount: number;
  absentSampleIds?: string[]; // absentsampleIds are only used for Upload Tsv flow
  // TODO: make these not optional when errors are added to sample Upload flow
  duplicatePrivateIds?: string[];
  duplicatePublicIds?: string[];
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
  absentSampleIds = [],
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

      {absentSampleIds.length > 0 && (
        <WarningAbsentSample absentSampleIds={absentSampleIds} />
      )}

      {!isEmpty(missingData) && (
        <WarningMissingData missingData={missingData} />
      )}

      {(duplicatePublicIds || duplicatePrivateIds) && (
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

function getIsParseResultCompletelyUnused(
  extraneousSampleIds: string[],
  parseResult: ParseResult | null
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
export function getMissingFields(parseResult: ParseResult): string[] | null {
  const { errorMessages } = parseResult;
  const missingFieldsErr = errorMessages.get(ERROR_CODE.MISSING_FIELD);
  return missingFieldsErr ? Array.from(missingFieldsErr) : null;
}
