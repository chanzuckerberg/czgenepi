import styled from "@emotion/styled";
import { Callout, CommonThemeProps, getFontWeights } from "czifui";

export const SemiBold = styled.span`
  ${(props: CommonThemeProps) => {
    const fontWeights = getFontWeights(props);
    return `
      font-weight: ${fontWeights?.semibold};
    `;
  }}
`;

export const StyledCallout = styled(Callout)`
  width: 100%;
`;
