import React, { FC } from "react";
import { IconButtonBubble } from "src/common/styles/support/style";
import { StyledDiv, StyledIconFilters } from "./style";

interface Props {
  activeFilterCount: number;
  onClick: () => void;
}

export const FilterPanelToggle: FC<Props> = ({
  activeFilterCount,
  onClick,
}): JSX.Element => {
  return (
    <StyledDiv>
      <IconButtonBubble onClick={onClick}>
        <StyledIconFilters /> {activeFilterCount}
      </IconButtonBubble>
    </StyledDiv>
  );
};
