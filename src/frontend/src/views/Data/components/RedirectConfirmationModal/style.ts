import styled from "@emotion/styled";
import { fontHeaderXl, getColors, getSpaces } from "czifui";
import { P } from "src/common/styles/basicStyle";

export const StyledHeader = styled.div`
  ${fontHeaderXl}
  ${(props) => {
    const spaces = getSpaces(props);
    return `
      margin-top: ${spaces?.l}px;
    `;
  }}
`;

export const StyledP = styled(P)`
  ${(props) => {
    const colors = getColors(props);
    return `
      color: ${colors?.gray[500]};
    `;
  }}
`;
