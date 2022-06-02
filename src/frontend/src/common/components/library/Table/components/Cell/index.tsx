import React, { ReactNode } from "react";
import { StyledCell } from "./style";

interface Props {
  content: ReactNode;
}

const Cell = ({ content }: Props): JSX.Element => {
  return <StyledCell>{content}</StyledCell>;
};

export { Cell };
