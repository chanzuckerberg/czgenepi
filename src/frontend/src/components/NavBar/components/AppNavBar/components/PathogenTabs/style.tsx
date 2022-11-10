import styled from "@emotion/styled";
import { Tab, Tabs } from "@mui/material";
import {
  CommonThemeProps,
  fontBodyM,
  getColors,
  getFontWeights,
  getPalette,
  getSpaces,
} from "czifui";
import { accessibleFocusBorder } from "src/common/styles/accessibility";

export const StyledTabs = styled(Tabs)`
  align-items: center;
  ${accessibleFocusBorder}

  ${(props: CommonThemeProps) => {
    const palette = getPalette(props);

    return `
      & .MuiTabs-indicator {
        background-color: ${palette?.common?.white};
      }
    `;
  }}
`;

export const StyledTab = styled(Tab)`
  ${fontBodyM}
  min-height: unset;
  padding: 0;
  min-width: 32px;
  opacity: 1 !important;
  ${(props: CommonThemeProps) => {
    const colors = getColors(props);
    const palette = getPalette(props);
    const spaces = getSpaces(props);
    const fontWeights = getFontWeights(props);

    return `
      margin-right: ${spaces?.xl}px;
      font-weight: ${fontWeights?.semibold};
      color: ${colors?.gray[400]};
      &:hover, &:focus, &:active, &.Mui-selected {
        color: ${palette?.common?.white};
      }
    `;
  }}
`;
