import React from "react";
import AlertAccordion from "src/components/AlertAccordion";
import { maybePluralize } from "./common/pluralize";

interface Props {
  sampleCount?: number;
}

export default function Warning({
  sampleCount: count,
}: Props): JSX.Element | null {
  if (!count) return null;

  const title = `${count} ${maybePluralize("Sample", count)} ${maybePluralize(
    "was",
    count
  )} updated.`;

  return (
    <AlertAccordion
      title={title}
      message={
        "We encountered contradictory data in your upload that we have " +
        "automatically resolved. Please review the alerts below and correct " +
        "any errors."
      }
      severity="warning"
    />
  );
}
