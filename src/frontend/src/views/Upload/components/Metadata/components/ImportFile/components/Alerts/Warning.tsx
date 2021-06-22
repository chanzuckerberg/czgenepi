import React from "react";
import AlertAccordion from "src/components/AlertAccordion";
import { maybePluralize } from "./common/pluralize";

interface Props {
  sampleCount?: number;
  unusedSampleIds?: string[];
}

export default function Warning({
  sampleCount: count = 0,
  unusedSampleIds = [],
}: Props): JSX.Element | null {
  if (!count && !unusedSampleIds.length) return null;

  const MESSAGES = {
    sampleCount: {
      message:
        "We encountered contradictory data in your upload that we have " +
        "automatically resolved. Please review the alerts below and correct " +
        "any errors.",
      title: `${count} ${maybePluralize("Sample", count)} ${maybePluralize(
        "was",
        count
      )} updated.`,
    },
    unusedSampleIds: {
      message:
        "The following sample IDs in the metadata file do not match " +
        `any sample IDs imported in the previous step: ${unusedSampleIds.join(
          ", "
        )}`,
      title: `${unusedSampleIds.length} ${maybePluralize(
        "Sample",
        unusedSampleIds.length
      )} in metadata file ${maybePluralize(
        "was",
        unusedSampleIds.length
      )} not used.`,
    },
  };

  const { title, message } = count
    ? MESSAGES.sampleCount
    : MESSAGES.unusedSampleIds;

  return <AlertAccordion title={title} message={message} severity="warning" />;
}
