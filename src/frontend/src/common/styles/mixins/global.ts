import styled from "@emotion/styled";
import { CommonThemeProps, getSpaces } from "czifui";
import { NAV_BAR_HEIGHT_PX } from "src/components/NavBar";

const BREAKPOINT = "768px";

export const SmallerThanBreakpoint = (styles: string): string => {
  return `
    @media (max-width: ${BREAKPOINT}) {
      ${styles}
    }
  `;
};

export const LargerThanBreakpoint = (styles: string): string => {
  return `
    @media (min-width: ${BREAKPOINT}) {
      ${styles}
    }
  `;
};

export const PAGE_PADDING = 125;

export const PageContent = styled.div`
  height: calc(100% - ${NAV_BAR_HEIGHT_PX}px);
`;

export const ContentStyles = (props: CommonThemeProps) => {
  const spaces = getSpaces(props);

  return `
    ${LargerThanBreakpoint(`
      padding: ${spaces?.xl}px ${PAGE_PADDING}px;
    `)}

    ${SmallerThanBreakpoint(`
      padding: ${spaces?.xl}px;
    `)}
  `;
};

export const MAX_CONTENT_WIDTH = 1308;
