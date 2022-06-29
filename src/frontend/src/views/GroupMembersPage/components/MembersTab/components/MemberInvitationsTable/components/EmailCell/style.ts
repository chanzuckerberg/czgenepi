import styled from "@emotion/styled";
import { Chip, getSpaces } from "czifui";

export const Wrapper = styled.span`
  display: flex;
  align-items: center;
`;

export const StyledChip = styled(Chip)`
  ${(props) => {
    const spaces = getSpaces(props);
    return `
      margin-left: ${spaces?.l}px;
    `;
  }}
`;
