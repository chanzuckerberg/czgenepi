import { Collapse } from "@material-ui/core";
import React, { useState } from "react";
import { pluralize } from "src/common/utils/strUtils";
import { SemiBold, StyledCallout } from "../../../FailedSampleAlert/style";
import { StyledArrowDownIcon, StyledArrowUpIcon } from "./style";

interface Props {
  missingSamples: string[];
}

const MissingSampleAlert = ({ missingSamples }: Props): JSX.Element | null => {
  const [areMissingIdsShown, setMissingIdsShown] = useState<boolean>(false);

  const numMissingSamples = missingSamples.length;
  if (numMissingSamples <= 0) return null;

  const toggleCollapse = () => {
    setMissingIdsShown(!areMissingIdsShown);
  };

  return (
    <StyledCallout intent="warning" onClick={toggleCollapse}>
      <div>
        <SemiBold>
          {numMissingSamples} Sample {pluralize("ID", numMissingSamples)}{" "}
          couldn’t be found
        </SemiBold>{" "}
        and may not appear on your tree. Please double check and correct any
        errors.
        {areMissingIdsShown ? <StyledArrowUpIcon /> : <StyledArrowDownIcon />}
      </div>
      <Collapse in={areMissingIdsShown}>
        <div>{missingSamples}</div>
      </Collapse>
    </StyledCallout>
  );
};

export { MissingSampleAlert };
