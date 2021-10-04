import styled from "@emotion/styled";
import { fontBodyXs, getColors, getFontWeights, getSpacings } from "czifui";
import { NewTabLink } from "../../../NewTabLink";

export const StyledDiv = styled.div`
  ${(props) => {
    const colors = getColors(props);
    const spacings = getSpacings(props);

    return `
      margin-left: ${spacings?.l}px;

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

export const StyledLink = styled(NewTabLink)`
  display: flex;
  align-items: center;
`;

export const StyledSpan = styled.span`
  ${fontBodyXs}
  ${(props) => {
    const fontWeights = getFontWeights(props);
    const spacings = getSpacings(props);

    return `
      font-weight: ${fontWeights?.semibold};
      margin: 0 ${spacings?.xxs}px;
    `;
  }}
`;
