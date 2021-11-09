import styled from "@emotion/styled";
import { getFontWeights, getSpaces } from "czifui";

export const SemiBold = styled.span`
  ${(props) => {
    const fontWeights = getFontWeights(props);
    return `
      font-weight: ${fontWeights?.semibold};
    `;
  }}
`;

export const StyledWrapper = styled.div`
  ${(props) => {
    const spaces = getSpaces(props);
    return `
      margin-bottom: ${spaces?.xxxs}px;
    `;
  }}
`;
