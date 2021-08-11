import React, { FC } from "react";
import { StyledButton } from "src/common/components/library/data_subview/style";
import { StyledDiv, StyledIconFilters } from "./style";

interface Props {
  onClick: () => void;
}

export const FilterPanelToggle: FC = ({ onClick }: Props) => {
  return (
    <StyledDiv>
      <StyledButton onClick={onClick}>
        <StyledIconFilters size="large" />
      </StyledButton>
    </StyledDiv>
  );
};
