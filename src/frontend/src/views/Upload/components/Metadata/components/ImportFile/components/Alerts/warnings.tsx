import React from "react";
import AlertAccordion from "src/components/AlertAccordion";
import { maybePluralize } from "./common/pluralize";

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
  const message = `The following sample IDs in the metadata file do not match any sample IDs imported in the previous step: ${extraneousSampleIds.join(
    ", "
  )}`;
  return (
    <AlertAccordion
      title={title}
      message={message}
      severity={WARNING_SEVERITY}
    />
  );
}
