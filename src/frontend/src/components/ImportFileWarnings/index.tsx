import { isEmpty } from "lodash";
import React from "react";
import {
  ParseResult as ParseResultEdit,
  SampleIdToWarningMessages as SampleIdToWarningMessagesEdit,
} from "src/common/components/library/data_subview/components/EditSamplesConfirmationModal/components/ImportFile/parseFile";
import { WebformTableTypeOptions as MetadataUploadTypeOption } from "src/components/WebformTable";
import { ERROR_CODE } from "src/components/WebformTable/common/types";
import Error from "src/views/Upload/components/Metadata/components/ImportFile/components/Alerts/Error";
import Success from "src/views/Upload/components/Metadata/components/ImportFile/components/Alerts/Success";
import {
  WarningAbsentSample,
  WarningAutoCorrect,
  WarningBadFormatData,
  WarningExtraneousEntry,
  WarningExtraneousEntrySampleEdit,
  WarningMissingData,
} from "src/views/Upload/components/Metadata/components/ImportFile/components/Alerts/warnings";
import {
  ParseResult as ParseResultUpload,
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
  missingData,
  badFormatData,
  IdColumnNameForWarnings,
  metadataUploadType,
}: ImportFileWarningsProps): JSX.Element {
  return (
    <>
      <RenderOrNull
        condition={
          hasImportedFile &&
          !getIsParseResultCompletelyUnused(extraneousSampleIds, parseResult)
        }
      >
        <Success filename={filename} />
      </RenderOrNull>

      <RenderOrNull condition={missingFields}>
        <Error errorCode={ERROR_CODE.MISSING_FIELD} names={missingFields} />
      </RenderOrNull>

      <RenderOrNull condition={autocorrectCount}>
        <WarningAutoCorrect autocorrectedSamplesCount={autocorrectCount} />
      </RenderOrNull>
      {metadataUploadType == MetadataUploadTypeOption.Edit && (
        <RenderOrNull condition={extraneousSampleIds.length}>
          <WarningExtraneousEntrySampleEdit
            extraneousSampleIds={extraneousSampleIds}
          />
        </RenderOrNull>
      )}
      {metadataUploadType == MetadataUploadTypeOption.Upload && (
        <RenderOrNull condition={extraneousSampleIds.length}>
          <WarningExtraneousEntry extraneousSampleIds={extraneousSampleIds} />
        </RenderOrNull>
      )}
      {absentSampleIds && (
        <RenderOrNull condition={absentSampleIds.length}>
          <WarningAbsentSample absentSampleIds={absentSampleIds} />
        </RenderOrNull>
      )}
      <RenderOrNull condition={!isEmpty(missingData)}>
        <WarningMissingData missingData={missingData} />
      </RenderOrNull>

      <RenderOrNull condition={!isEmpty(badFormatData)}>
        <WarningBadFormatData
          badFormatData={badFormatData}
          IdColumnNameForWarnings={IdColumnNameForWarnings}
        />
      </RenderOrNull>
    </>
  );
}

function RenderOrNull({
  condition,
  children,
}: {
  condition: unknown;
  children: React.ReactNode;
}): JSX.Element | null {
  if (!condition) return null;

  return <>{children}</>;
}

function getIsParseResultCompletelyUnused(
  extraneousSampleIds: string[],
  parseResult: ParseResultEdit | ParseResultUpload | null
) {
  if (!parseResult) return true;

  const { data } = parseResult;

  return extraneousSampleIds.length === Object.keys(data).length;
}
