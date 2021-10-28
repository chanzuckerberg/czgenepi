import styled from "@emotion/styled";
import { Callout, getFontWeights, getSpaces } from "czifui";

export const SemiBold = styled.span`
  ${(props) => {
    const fontWeights = getFontWeights(props);
    return `
      font-weight: ${fontWeights?.semibold};
    `;
  }}
`;

export const StyledCallout = styled(Callout)`
  width: 100%;

  ${(props) => {
    const spaces = getSpaces(props);
    return `
      margin: ${spaces?.xl}px 0;
    `;
  }}
`;
