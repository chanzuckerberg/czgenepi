import { ReactNode } from "react";
import { StyledCell } from "./style";

interface Props {
  content: ReactNode;
}

const NO_CONTENT_FALLBACK = "--";

const Cell = ({ content }: Props): JSX.Element => {
  return <StyledCell>{content ?? NO_CONTENT_FALLBACK}</StyledCell>;
};

export { Cell };
