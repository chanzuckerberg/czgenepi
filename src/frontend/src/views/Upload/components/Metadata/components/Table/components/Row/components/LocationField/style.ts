import styled from "@emotion/styled";
import { getSpaces } from "czifui";

export const StyledDiv = styled.div`
  ${(props) => {
    const spaces = getSpaces(props);

    return `
      padding-right: ${spaces?.l}px;
    `;
  }}
`;
