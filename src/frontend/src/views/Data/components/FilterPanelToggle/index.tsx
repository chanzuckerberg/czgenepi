import React, { FC } from "react";
import { IconButtonBubble } from "src/common/styles/support/style";
import { StyledDiv, StyledIconFilters } from "./style";

interface Props {
  onClick: () => void;
}

export const FilterPanelToggle: FC = ({ onClick }: Props) => {
  return (
    <StyledDiv>
      <IconButtonBubble onClick={onClick}>
        <StyledIconFilters size="large" />
      </IconButtonBubble>
    </StyledDiv>
  );
};
