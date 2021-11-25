import { Collapse } from "@material-ui/core";
import React, { useState } from "react";
import { pluralize } from "src/common/utils/strUtils";
import { SemiBold } from "../../../FailedSampleAlert/style";
import {
  ColumnFlexContainer,
  RowFlexContainer,
  StaticSizeDiv,
  StyledArrowDownIcon,
  StyledArrowUpIcon,
  StyledCallout,
  StyledList,
  StyledListItem,
} from "./style";

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
      <RowFlexContainer>
        <ColumnFlexContainer>
          <StaticSizeDiv>
            <SemiBold>
              {numMissingSamples} Sample {pluralize("ID", numMissingSamples)}{" "}
              couldn’t be found
            </SemiBold>{" "}
            and will not appear on your tree.
          </StaticSizeDiv>
          <Collapse in={areMissingIdsShown}>
            <StyledList>
              {missingSamples.map((sample) => {
                return <StyledListItem key={sample}>{sample}</StyledListItem>;
              })}
            </StyledList>
          </Collapse>
        </ColumnFlexContainer>
        {areMissingIdsShown ? <StyledArrowUpIcon /> : <StyledArrowDownIcon />}
      </RowFlexContainer>
    </StyledCallout>
  );
};

export { MissingSampleAlert };
