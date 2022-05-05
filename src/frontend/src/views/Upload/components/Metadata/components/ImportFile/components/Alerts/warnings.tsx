import React from "react";
import { SampleEditIdToWarningMessages } from "src/common/components/library/data_subview/components/EditSamplesConfirmationModal/components/ImportFile/parseFile";
import { B } from "src/common/styles/basicStyle";
import { pluralize } from "src/common/utils/strUtils";
import AlertAccordion from "src/components/AlertAccordion";
import {
  OPTIONAL_HEADER_MARKER,
  SAMPLE_EDIT_METADATA_KEYS_TO_HEADERS,
  SAMPLE_UPLOAD_METADATA_KEYS_TO_HEADERS,
} from "src/components/DownloadMetadataTemplate/common/constants";
import { SampleIdToWarningMessages } from "../../parseFile";
import { ProblemTable } from "./common/ProblemTable";

const WARNING_SEVERITY = "warning";

/**
 *  WARNING_CODE.AUTO_CORRECT
 * (Vince -- Jan 28, 2022): Currently unused due to change in when we auto
 * correct. While won't occur right now, there is an upcoming feature for
 * providing notice when parsing uploaded collectionLocation, so leaving
 * this warning component in for now, although will likely need revamp.
 */
interface PropsAutoCorrect {
  autocorrectedSamplesCount: number;
}
export function WarningAutoCorrect({
  autocorrectedSamplesCount,
}: PropsAutoCorrect): JSX.Element {
  // "X samples were updated."
  const title = `${autocorrectedSamplesCount} ${pluralize(
    "Sample",
    autocorrectedSamplesCount
  )} ${pluralize("was", autocorrectedSamplesCount)} updated.`;
  const message =
    "We encountered contradictory data in your upload that we have " +
    "automatically resolved. Please review the alerts below and correct " +
    "any errors.";
  return (
    <AlertAccordion
      title={title}
      collapseContent={message}
      intent={WARNING_SEVERITY}
    />
  );
}

/**
 * WARNING_CODE.EXTRANEOUS_ENTRY (SAMPLE UPLOAD)
 */
interface PropsExtraneousEntry {
  extraneousSampleIds: string[];
}
function MessageExtraneousEntry({ extraneousSampleIds }: PropsExtraneousEntry) {
  const tablePreamble =
    "The following sample IDs in the metadata file " +
    "do not match any sample IDs imported in the previous step.";
  const columnHeaders = [SAMPLE_UPLOAD_METADATA_KEYS_TO_HEADERS.sampleId];
  const rows = extraneousSampleIds.map((sampleId) => [sampleId]);
  return (
    <ProblemTable
      tablePreamble={tablePreamble}
      columnHeaders={columnHeaders}
      rows={rows}
    />
  );
}
export function WarningExtraneousEntry({
  extraneousSampleIds,
}: PropsExtraneousEntry): JSX.Element {
  const count = extraneousSampleIds.length;
  // "X Samples in metadata file were not used."
  const title = `${count} ${pluralize(
    "Sample",
    count
  )} in metadata file ${pluralize("was", count)} not used.`;
  return (
    <AlertAccordion
      title={title}
      collapseContent={
        <MessageExtraneousEntry extraneousSampleIds={extraneousSampleIds} />
      }
      intent={WARNING_SEVERITY}
    />
  );
}

/**
 * WARNING_CODE.EXTRANEOUS_ENTRY (SAMPLE EDIT)
 * (mostly similar to the above implementation, wording is different enough to have it's own component)
 */
function MessageExtraneousEntrySampleEdit({
  extraneousSampleIds,
}: PropsExtraneousEntry) {
  const tablePreamble =
    "The following IDs in your file’s “Current Private ID” column did not match any selected " +
    "samples, and weren’t imported. Please double check and correct any errors. ";
  const columnHeaders = [SAMPLE_EDIT_METADATA_KEYS_TO_HEADERS.currentPrivateID];
  const rows = extraneousSampleIds.map((sampleId) => [sampleId]);
  return (
    <ProblemTable
      tablePreamble={tablePreamble}
      columnHeaders={columnHeaders}
      rows={rows}
    />
  );
}

export function WarningExtraneousEntrySampleEdit({
  extraneousSampleIds,
}: PropsExtraneousEntry): JSX.Element {
  const count = extraneousSampleIds.length;
  // "X Samples in metadata file were not used."

  const title = `${count} ${pluralize(
    "Sample",
    count
  )} in metadata file ${pluralize(
    "was",
    count
  )} couldn't be matched and weren't imported.`;
  return (
    <AlertAccordion
      title={title}
      collapseContent={
        <MessageExtraneousEntrySampleEdit
          extraneousSampleIds={extraneousSampleIds}
        />
      }
      intent={WARNING_SEVERITY}
    />
  );
}

/**
 * WARNING_CODE.ABSENT_SAMPLE
 */
interface PropsAbsentSample {
  absentSampleIds: string[];
}
function MessageAbsentSample({ absentSampleIds }: PropsAbsentSample) {
  const tablePreamble =
    "The following sample IDs were imported in the " +
    "previous step but did not match any sample IDs in the metadata file.";
  const columnHeaders = [SAMPLE_UPLOAD_METADATA_KEYS_TO_HEADERS.sampleId];
  const rows = absentSampleIds.map((sampleId) => [sampleId]);
  return (
    <ProblemTable
      tablePreamble={tablePreamble}
      columnHeaders={columnHeaders}
      rows={rows}
    />
  );
}

function MessageAbsentSampleEdit({ absentSampleIds }: PropsAbsentSample) {
  const tablePreamble =
    "The following IDs in your file’s “Current Private ID” column did not match any selected samples, and weren’t imported. Please double check and correct any errors. ";
  const columnHeaders = [SAMPLE_EDIT_METADATA_KEYS_TO_HEADERS.currentPrivateID];
  const rows = absentSampleIds.map((sampleId) => [sampleId]);
  return (
    <ProblemTable
      tablePreamble={tablePreamble}
      columnHeaders={columnHeaders}
      rows={rows}
    />
  );
}

export function WarningAbsentSample({
  absentSampleIds,
}: PropsAbsentSample): JSX.Element {
  const count = absentSampleIds.length;
  // "X Samples were not found in metadata file."
  const title = `${count} ${pluralize("Sample", count)} ${pluralize(
    "was",
    count
  )} not found in metadata file.`;
  return (
    <AlertAccordion
      title={title}
      collapseContent={
        <MessageAbsentSample absentSampleIds={absentSampleIds} />
      }
      intent={WARNING_SEVERITY}
    />
  );
}

export function WarningAbsentSampleEdit({
  absentSampleIds,
}: PropsAbsentSample): JSX.Element {
  const count = absentSampleIds.length;
  // "X Samples were not found in metadata file."
  const title = `${count} ${pluralize(
    "Sample",
    count
  )} in metadata file couldn't be matched and ${pluralize(
    "was",
    count
  )} not imported`;
  return (
    <AlertAccordion
      title={title}
      collapseContent={
        <MessageAbsentSampleEdit absentSampleIds={absentSampleIds} />
      }
      intent={WARNING_SEVERITY}
    />
  );
}

/**
 * WARNING_CODE.MISSING_DATA
 */
interface PropsMissingData {
  missingData: SampleIdToWarningMessages | SampleEditIdToWarningMessages;
}
function MessageMissingData({ missingData }: PropsMissingData) {
  const tablePreamble =
    "You can add the required data in the table below, " +
    "or update your file and re-import.";
  const columnHeaders = [
    SAMPLE_UPLOAD_METADATA_KEYS_TO_HEADERS.sampleId,
    "Missing Data",
  ];
  const rows = getSampleIdsWithMissingData(missingData);
  return (
    <ProblemTable
      tablePreamble={tablePreamble}
      columnHeaders={columnHeaders}
      rows={rows}
    />
  );
}

function getSampleIdsWithMissingData(missingData: SampleIdToWarningMessages) {
  const idsMissingData = Object.keys(missingData);
  return idsMissingData.map((sampleId) => {
    const missingHeaders = Array.from(
      missingData[sampleId],
      (missingKey) => SAMPLE_UPLOAD_METADATA_KEYS_TO_HEADERS[missingKey]
    );
    const missingDataDescription = missingHeaders.join(", ");
    return [sampleId, missingDataDescription];
  });
}

function MessageMissingDataEdit({ missingData }: PropsMissingData) {
  const tablePreamble =
    "You can add the required data in the table below, " +
    "or update your file and re-import.";
  const columnHeaders = [
    "Sample " + SAMPLE_UPLOAD_METADATA_KEYS_TO_HEADERS.privateId,
    "Missing Data",
  ];
  const rows = getSampleIdsWithMissingData(missingData);
  return (
    <ProblemTable
      tablePreamble={tablePreamble}
      columnHeaders={columnHeaders}
      rows={rows}
    />
  );
}

export function WarningMissingData({
  missingData,
}: PropsMissingData): JSX.Element {
  const count = Object.keys(missingData).length;
  // "X Samples were missing data in required fields."
  const title = `${count} ${pluralize("Sample", count)} ${pluralize(
    "was",
    count
  )} missing data in required fields.`;
  return (
    <AlertAccordion
      title={title}
      collapseContent={<MessageMissingData missingData={missingData} />}
      intent={WARNING_SEVERITY}
    />
  );
}

export function WarningMissingDataEdit({
  missingData,
}: PropsMissingData): JSX.Element {
  const count = Object.keys(missingData).length;
  // "X Samples were missing data in required fields."
  const title = `${count} ${pluralize("Sample", count)} ${pluralize(
    "was",
    count
  )} missing data in required fields.`;
  return (
    <AlertAccordion
      title={title}
      collapseContent={<MessageMissingDataEdit missingData={missingData} />}
      intent={WARNING_SEVERITY}
    />
  );
}

/**
 * WARNING_CODE.BAD_FORMAT_DATA
 */
const BadFormatDataTablePreamble = (
  <>
    <p>
      You can change the invalid data in the table below, or update your file
      and re-import.
    </p>
    <p>
      <B>Formatting requirements:</B>
    </p>
    <ul>
      <li>
        Private IDs must be no longer than 120 characters and can only contain
        letters from the English alphabet (A-Z, upper and lower case), numbers
        (0-9), periods (.), hyphens (-), underscores (_), spaces ( ), and
        forward slashes (/).
      </li>
      <li>Dates must be in the format of YYYY-MM-DD.</li>
    </ul>
  </>
);

interface PropsBadFormatData {
  badFormatData: SampleIdToWarningMessages;
  IdColumnNameForWarnings: string;
}
function MessageBadFormatData({
  badFormatData,
  IdColumnNameForWarnings,
}: PropsBadFormatData) {
  const tablePreamble = BadFormatDataTablePreamble;
  const columnHeaders = [
    IdColumnNameForWarnings,
    "Data with Invalid Formatting",
  ];
  const idsBadFormatData = Object.keys(badFormatData);
  const rows = idsBadFormatData.map((sampleId) => {
    const badFormatRawHeaders = Array.from(
      badFormatData[sampleId],
      (badFormatKey) => SAMPLE_UPLOAD_METADATA_KEYS_TO_HEADERS[badFormatKey]
    );
    // Some headers say "optional" in them: we don't put that in description
    const badFormatPrettyHeaders = badFormatRawHeaders.map((header) => {
      return header.replace(OPTIONAL_HEADER_MARKER, "");
    });
    const badFormatDescription = badFormatPrettyHeaders.join(", ");
    return [sampleId, badFormatDescription];
  });
  return (
    <ProblemTable
      tablePreamble={tablePreamble}
      columnHeaders={columnHeaders}
      rows={rows}
    />
  );
}

export function ErrorBadFormatData({
  badFormatData,
  IdColumnNameForWarnings,
}: PropsBadFormatData): JSX.Element {
  const title =
    "Some of your data is not formatted correctly. " +
    "Please update before proceeding.";
  return (
    <AlertAccordion
      title={title}
      collapseContent={
        <MessageBadFormatData
          badFormatData={badFormatData}
          IdColumnNameForWarnings={IdColumnNameForWarnings}
        />
      }
      intent="error"
    />
  );
}
