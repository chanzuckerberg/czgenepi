import styled from "@emotion/styled";
import {
  CommonThemeProps,
  fontBodyXs,
  getFontWeights,
  getSpaces,
} from "czifui";

export const SemiBold = styled.span`
  ${(props: CommonThemeProps) => {
    const fontWeights = getFontWeights(props);
    return `
      font-weight: ${fontWeights?.semibold};
    `;
  }}
`;

export const StyledWrapper = styled.div`
  .MuiListItem-root div {
    ${fontBodyXs}
  }

  ${(props: CommonThemeProps) => {
    const spaces = getSpaces(props);
    return `
      margin-bottom: ${spaces?.xxxs}px;
    `;
  }}
`;
