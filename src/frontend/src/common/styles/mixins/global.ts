import styled from "@emotion/styled";
import { CommonThemeProps, getSpaces } from "czifui";

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

const NAV_BAR_HEIGHT_PX = 46;
export const PageContent = styled.div`
  height: calc(100% - ${NAV_BAR_HEIGHT_PX}px);
`;

export const ContentStyles = (props: CommonThemeProps): string => {
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

export const ZebraStripes = (): string => {
  return `
    :nth-of-type(odd) {
      background-color: rgba(0, 0, 0, 0.04);
    }
  `;
};
