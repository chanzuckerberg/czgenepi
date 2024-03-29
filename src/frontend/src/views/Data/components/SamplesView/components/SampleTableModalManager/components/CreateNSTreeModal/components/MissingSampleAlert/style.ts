import styled from "@emotion/styled";
import {
  CommonThemeProps,
  fontBodyXs,
  getFontWeights,
  getSpaces,
} from "czifui";
import { ZebraStripes } from "src/common/styles/mixins/global";

export const StyledList = styled.ul`
  padding: 0;

  li {
    ${ZebraStripes}
  }
`;

export const StyledListItem = styled.li`
  ${fontBodyXs}
  list-style-type: none;

  ${(props: CommonThemeProps) => {
    const spaces = getSpaces(props);

    return `
      padding: ${spaces?.m}px;
    `;
  }}
`;

export const SemiBold = styled.span`
  ${(props: CommonThemeProps) => {
    const fontWeights = getFontWeights(props);
    return `
      font-weight: ${fontWeights?.semibold};
    `;
  }}
`;
