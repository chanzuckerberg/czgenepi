import styled from "@emotion/styled";
import {
  Callout,
  CommonThemeProps,
  fontBodyM,
  fontBodyXs,
  fontHeaderM,
  fontHeaderXl,
  getColors,
  getSpaces,
} from "czifui";
import { iconFillGrayHoverPrimary } from "src/common/styles/iconStyle";
import {
  LargerThanBreakpoint,
  MAX_CONTENT_WIDTH,
} from "src/common/styles/mixins/global";

export const DetailDisplay = styled.div`
  ${fontBodyM}
  ${(props: CommonThemeProps) => {
    const colors = getColors(props);
    const spaces = getSpaces(props);

    return `
      padding: ${spaces?.l}px;
      background-color: ${colors?.gray[100]};
      margin-bottom: ${spaces?.xl}px;
      white-space: pre-wrap;
      overflow-wrap: break-word;
    `;
  }}
`;

export const DetailHeader = styled.div`
  ${fontHeaderXl}

  ${(props: CommonThemeProps) => {
    const spaces = getSpaces(props);
    return `
      margin-bottom: ${spaces?.xxxs}px;
      width: 100%;
    `;
  }}
`;

export const DetailSection = styled.div`
  ${(props: CommonThemeProps) => {
    const colors = getColors(props);
    const spaces = getSpaces(props);
    return `
      ${LargerThanBreakpoint(`
        width: 50%;

        &:first-child {
          padding-right: ${spaces?.xl}px;
          border-right: 1px solid ${colors?.gray[300]};
        }

        &:last-child {
          padding-left: ${spaces?.xl}px;
        }
      `)}
    `;
  }}
`;

export const DetailSubheader = styled.div`
  ${fontHeaderM}

  display: flex;

  ${(props) => {
    const spaces = getSpaces(props);

    return `
      margin-bottom: ${spaces?.m}px;
    `;
  }}
`;

export const Text = styled.div`
  ${fontBodyXs}

  ${(props: CommonThemeProps) => {
    const colors = getColors(props);
    const spaces = getSpaces(props);

    return `
      color: ${colors?.gray[600]};
      margin-bottom: ${spaces?.l}px;
    `;
  }}
`;

export const DetailPage = styled.div`
  ${LargerThanBreakpoint(`
      display: flex;
      flex-wrap: wrap;
      max-width: ${MAX_CONTENT_WIDTH}px;
      margin: auto;
  `)}
`;

export const Content = styled.div`
  ${LargerThanBreakpoint(`
    display: flex;
    justify-content: center;
  `)}
`;

export const StyledCallout = styled(Callout)`
  flex: 1 1 auto;
  width: auto;
  margin-top: 0;

  ${(props: CommonThemeProps) => {
    const spaces = getSpaces(props);
    return `
      margin-bottom: ${spaces?.xl}px;
    `;
  }}
`;

export const StyledInfoIconWrapper = styled.div`
  ${iconFillGrayHoverPrimary}

  ${(props: CommonThemeProps) => {
    const spaces = getSpaces(props);
    return `
      margin-left: ${spaces?.xs}px;
      margin-top: ${spaces?.xxxs}px;
    `;
  }}
`;
