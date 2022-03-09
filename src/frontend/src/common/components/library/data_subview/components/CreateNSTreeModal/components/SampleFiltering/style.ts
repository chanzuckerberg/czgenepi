import styled from "@emotion/styled";
import { fontHeaderXs, getSpaces } from "czifui";

export const StyledContainer = styled.div`
  ${(props) => {
    const spaces = getSpaces(props);
    return `
      margin-top: ${spaces?.l}px;
    `;
  }}
`;

export const StyledExplainerTitle = styled.div`
  ${fontHeaderXs}
  color: black;
`;
