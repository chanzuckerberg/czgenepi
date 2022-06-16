import React, { CSSProperties, ReactNode } from "react";
import { Cell } from "../Cell";
import { StyledHeader, StyledRow } from "./style";

interface Props {
  cells: ReactNode[];
  isHeader?: boolean;
  style?: CSSProperties;
}

const Row = ({ cells, isHeader, style }: Props): JSX.Element | null => {
  if (cells.length === 0) return null;

  const mappedCells = cells.map((c, i) => <Cell key={i} content={c} />);

  if (isHeader) {
    return <StyledHeader style={style}>{mappedCells}</StyledHeader>;
  }

  return <StyledRow style={style}>{mappedCells}</StyledRow>;
};

export { Row };
