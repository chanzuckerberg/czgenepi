import styled from "@emotion/styled";
import { fontBodyS, fontBodyXs, getColors, getSpaces } from "czifui";

export const StyledPreTitle = styled.span`
  ${fontBodyS}

  ${(props) => {
    const colors = getColors(props);
    const spaces = getSpaces(props);
    return `
      color: ${colors?.gray[600]};
      margin-bottom: ${spaces?.xxxs}px;
    `;
  }}
`;

export const StyledSubTitle = styled.span`
  ${fontBodyXs}

  ${(props) => {
    const colors = getColors(props);
    const spaces = getSpaces(props);
    return `
      color: ${colors?.gray[600]};
      margin-bottom: ${spaces?.xl}px;
    `;
  }}
`;
