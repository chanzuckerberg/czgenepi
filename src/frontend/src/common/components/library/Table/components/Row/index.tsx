import React, { ReactNode } from "react";
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
        {cells.map((c, i) => (
          <Cell key={i} content={c} />
        ))}
      </StyledHeader>
    );
  }

  return (
    <StyledRow>
      {cells.map((c, i) => (
        <Cell key={i} content={c} />
      ))}
    </StyledRow>
  );
};

export { Row };
