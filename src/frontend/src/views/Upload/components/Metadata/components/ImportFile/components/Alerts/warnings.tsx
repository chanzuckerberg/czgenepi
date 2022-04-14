import React from "react";
import { B } from "src/common/styles/basicStyle";
import { pluralize } from "src/common/utils/strUtils";
import AlertAccordion from "src/components/AlertAccordion";
import {
  OPTIONAL_HEADER_MARKER,
  SAMPLE_UPLOAD_METADATA_KEYS_TO_HEADERS,
} from "src/components/DownloadMetadataTemplate/common/constants";
import { SampleIdToWarningMessages } from "../../parseFile";
import { ProblemTable } from "./common/ProblemTable";
import { FullWidthAlertAccordion } from "./common/style";

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
      message={message}
      severity={WARNING_SEVERITY}
    />
  );
}

/**
 * WARNING_CODE.EXTRANEOUS_ENTRY
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
    <FullWidthAlertAccordion
      title={title}
      message={
        <MessageExtraneousEntry extraneousSampleIds={extraneousSampleIds} />
      }
      severity={WARNING_SEVERITY}
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
    <FullWidthAlertAccordion
      title={title}
      message={<MessageAbsentSample absentSampleIds={absentSampleIds} />}
      severity={WARNING_SEVERITY}
    />
  );
}

/**
 * WARNING_CODE.MISSING_DATA
 */
interface PropsMissingData {
  missingData: SampleIdToWarningMessages;
}
function MessageMissingData({ missingData }: PropsMissingData) {
  const tablePreamble =
    "You can add the required data in the table below, " +
    "or update your file and re-import.";
  const columnHeaders = [
    SAMPLE_UPLOAD_METADATA_KEYS_TO_HEADERS.sampleId,
    "Missing Data",
  ];
  const idsMissingData = Object.keys(missingData);
  const rows = idsMissingData.map((sampleId) => {
    const missingHeaders = Array.from(
      missingData[sampleId],
      (missingKey) => SAMPLE_UPLOAD_METADATA_KEYS_TO_HEADERS[missingKey]
    );
    const missingDataDescription = missingHeaders.join(", ");
    return [sampleId, missingDataDescription];
  });
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
    <FullWidthAlertAccordion
      title={title}
      message={<MessageMissingData missingData={missingData} />}
      severity={WARNING_SEVERITY}
    />
  );
}

/**
 * WARNING_CODE.BAD_FORMAT_DATA
 */
interface PropsBadFormatData {
  badFormatData: SampleIdToWarningMessages;
}
function MessageBadFormatData({ badFormatData }: PropsBadFormatData) {
  const tablePreamble = (
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

  const columnHeaders = [
    SAMPLE_UPLOAD_METADATA_KEYS_TO_HEADERS.sampleId,
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
export function WarningBadFormatData({
  badFormatData,
}: PropsBadFormatData): JSX.Element {
  const title =
    "Some of your data is not formatted correctly. " +
    "Please update before proceeding.";
  return (
    <FullWidthAlertAccordion
      title={title}
      message={<MessageBadFormatData badFormatData={badFormatData} />}
      severity={WARNING_SEVERITY}
    />
  );
}
