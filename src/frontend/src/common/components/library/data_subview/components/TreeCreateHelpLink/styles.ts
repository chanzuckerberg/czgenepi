import styled from "@emotion/styled";
import {
  CommonThemeProps,
  fontBodyXs,
  getColors,
  getFontWeights,
  getSpaces,
} from "czifui";
import { NewTabLink } from "../../../NewTabLink";

export const StyledDiv = styled.div`
  ${(props: CommonThemeProps) => {
    const colors = getColors(props);
    const spaces = getSpaces(props);

    return `
      margin-left: ${spaces?.l}px;

      &:hover {
        path {
          fill: ${colors?.primary[500]};
        }
      }

      &:active {
        path {
          fill: ${colors?.primary[600]};
        }
      }
    `;
  }}
`;

export const StyledNewTabLink = styled(NewTabLink)`
  display: flex;
  align-items: center;
`;

export const StyledSpan = styled.span`
  ${fontBodyXs}
  ${(props: CommonThemeProps) => {
    const fontWeights = getFontWeights(props);
    const spaces = getSpaces(props);

    return `
      font-weight: ${fontWeights?.semibold};
      margin: 0 ${spaces?.xxs}px;
    `;
  }}
`;
