import styled from "@emotion/styled";
import {
  CommonThemeProps,
  fontHeaderXxl,
  getColors,
  getSpaces,
  Tabs,
} from "czifui";
import {
  ContentStyles,
  PageContent,
  PAGE_PADDING,
  SmallerThanBreakpoint,
} from "src/common/styles/mixins/global";

export const StyledName = styled.div`
  ${fontHeaderXxl}

  ${(props) => {
    const spaces = getSpaces(props);
    return `
      margin: ${spaces?.xl}px 0;
    `;
  }}
`;

export const StyledPageContent = styled(PageContent)`
  ${ContentStyles}
`;

export const StyledTabs = styled(Tabs)`
  margin-bottom: unset;
  border-bottom: unset;
`;

export const StyledHeader = styled.div`
  ${(props: CommonThemeProps) => {
    const colors = getColors(props);
    const spaces = getSpaces(props);

    return `
      border-bottom: 2px solid ${colors?.gray[200]};
      padding: 0 ${PAGE_PADDING}px;

      ${SmallerThanBreakpoint(`
        padding: 0 ${spaces?.xl}px;
      `)}
    `;
  }}
`;
