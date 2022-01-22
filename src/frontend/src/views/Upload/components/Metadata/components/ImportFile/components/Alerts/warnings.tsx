import React from "react";
import AlertAccordion from "src/components/AlertAccordion";
import { METADATA_KEYS_TO_HEADERS } from "src/views/Upload/components/common/constants";
import { SampleIdToWarningMessages } from "../../parseFile";
import { maybePluralize } from "./common/pluralize";
import {
  FullWidthAlertAccordion,
  FullWidthContainer,
  Table,
  TbodyZebra,
  Td,
  Th,
} from "./common/style";

const WARNING_SEVERITY = "warning";

/**
 *  WARNING_CODE.AUTO_CORRECT
 */
interface PropsAutoCorrect {
  autocorrectedSamplesCount: number;
}
export function WarningAutoCorrect({
  autocorrectedSamplesCount,
}: PropsAutoCorrect) {
  // "X samples were updated."
  const title = `${autocorrectedSamplesCount} ${maybePluralize(
    "Sample",
    autocorrectedSamplesCount
  )} ${maybePluralize("was", autocorrectedSamplesCount)} updated.`;
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
export function WarningExtraneousEntry({
  extraneousSampleIds,
}: PropsExtraneousEntry) {
  const count = extraneousSampleIds.length;
  // "X Samples in metadata file were not used."
  const title = `${count} ${maybePluralize(
    "Sample",
    count
  )} in metadata file ${maybePluralize("was", count)} not used.`;
  const message = `The following sample IDs in the metadata file do not match
    any sample IDs imported in the previous step:
    ${extraneousSampleIds.join(", ")}`;
  return (
    <AlertAccordion
      title={title}
      message={message}
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
export function WarningAbsentSample({ absentSampleIds }: PropsAbsentSample) {
  const count = absentSampleIds.length;
  // "X Samples were not found in metadata file."
  const title = `${count} ${maybePluralize("Sample", count)} ${maybePluralize(
    "was",
    count
  )} not found in metadata file.`;
  const message = `The following sample IDs were imported in the previous step
    but did not match any sample IDs in the metadata file:
    ${absentSampleIds.join(", ")}`;
  return (
    <AlertAccordion
      title={title}
      message={message}
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

// Possibly worth generalizing this down the road and use in other Warnings
// and Errors (there's some similar stuff in the Error components, but the
// number of columns is only ever one over there).
function MessageMissingData({ missingData }: PropsMissingData) {
  const idsMissingData = Object.keys(missingData);
  return (
    <FullWidthContainer>
      You can add the required data in the table below, or update your file and
      re-import.
      <Table>
        <thead>
          <tr>
            <Th>Sample Private ID</Th>
            <Th>Missing Data</Th>
          </tr>
        </thead>
        <TbodyZebra>
          {idsMissingData.map((sampleId) => {
            const missingHeaders = Array.from(
              missingData[sampleId],
              (missingKey) => METADATA_KEYS_TO_HEADERS[missingKey]
            );
            const missingDescription = missingHeaders.join(", ");
            return (
              <tr key={sampleId}>
                <Td>{sampleId}</Td>
                <Td>{missingDescription}</Td>
              </tr>
            );
          })}
        </TbodyZebra>
      </Table>
    </FullWidthContainer>
  );
}

export function WarningMissingData({ missingData }: PropsMissingData) {
  const count = Object.keys(missingData).length;
  // "X Samples were missing data in required fields."
  const title = `${count} ${maybePluralize("Sample", count)} ${maybePluralize(
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
