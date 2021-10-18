import { Alert } from "czifui";
import React from "react";
import { pluralize } from "src/common/utils/strUtils";
import {
  AlertInstructionsNotSemiBold,
  AlertInstructionsSemiBold,
  StyledWarningIcon,
} from "./style";

interface Props {
  numFailedSamples: number;
}

const FailedSampleAlert = ({ numFailedSamples }: Props): JSX.Element | null => {
  if (numFailedSamples <= 0) return null;

  return (
    <Alert icon={<StyledWarningIcon />} severity="warning">
      <AlertInstructionsSemiBold>
        {" "}
        {numFailedSamples} Selected {pluralize("Sample", numFailedSamples)}
        {" won't "}
        be included in your tree{" "}
      </AlertInstructionsSemiBold>
      <AlertInstructionsNotSemiBold>
        because they failed genome recovery.
      </AlertInstructionsNotSemiBold>
    </Alert>
  );
};

export { FailedSampleAlert };
