import React from "react";
import { Cell } from "../Cell";
import { StyledHeader, StyledRow } from "./style";

interface Props {
  cells: ReactNode[];
  isHeader?: boolean;
}

const Row = ({ cells, isHeader }: Props): JSX.Element | null => {
  if (cells.length === 0) return null;

  if (isHeader) {
    return (
      <StyledHeader>
        {cells.map((c) => <Cell content={c} />)}
      </StyledHeader>
    );
  }

  return (
    <StyledRow>
      {cells.map((c) => <Cell content={c} />)}
    </StyledRow>
  );
};

export { Row };
