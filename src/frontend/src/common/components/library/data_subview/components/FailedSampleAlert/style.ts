import styled from "@emotion/styled";
import { Callout, getFontWeights } from "czifui";

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
`;
