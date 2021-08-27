import styled from "@emotion/styled";
import { fontBodyXs, getColors, getFontWeights, getSpacings } from "czifui";

export const StyledDateRange = styled.div`
  display: flex;
  align-items: center;

  ${(props) => {
    const colors = getColors(props);
    return `
      border-bottom: 1px solid ${colors?.gray[500]};
    `;
  }}
`;

export const StyledText = styled.span`
  ${fontBodyXs}
  ${(props) => {
    const fontWeights = getFontWeights(props);
    const spacings = getSpacings(props);
    return `
      font-weight: ${fontWeights?.semibold};
      margin: 0 ${spacings?.xs}px ;
    `;
  }}
`;
