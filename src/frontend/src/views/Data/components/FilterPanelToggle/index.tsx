import React, { FC } from "react";
import { IconButtonBubble } from "src/common/styles/support/style";
import { StyledDiv, StyledIconFilters } from "./style";

interface Props {
  onClick: () => void;
}

export const FilterPanelToggle: FC<Props> = ({ onClick }): JSX.Element => {
  return (
    <StyledDiv>
      <IconButtonBubble onClick={onClick}>
        <StyledIconFilters />
      </IconButtonBubble>
    </StyledDiv>
  );
};
