import styled from "@emotion/styled";
import {
  Button,
  Chip,
  CommonThemeProps,
  fontHeaderXs,
  getColors,
  getFontWeights,
  getSpaces,
} from "czifui";
import { MAX_CONTENT_WIDTH } from "src/common/styles/mixins/global";

export const StyledDiv = styled.div`
  ${fontHeaderXs}
  ${(props: CommonThemeProps) => {
    const spaces = getSpaces(props);
    const fontWeights = getFontWeights(props);
    return `
    margin-left: ${spaces?.m}px;
    font-weight: ${fontWeights?.semibold};
    color: black;
    `;
  }}
`;

export const Divider = styled.div`
  height: 28px;

  ${(props: CommonThemeProps) => {
    const spaces = getSpaces(props);
    const colors = getColors(props);
    return `
    margin-left: ${spaces?.xl}px;
    border-right: 1px solid ${colors?.gray[500]};
    `;
  }}
`;

export const StyledChip = styled(Chip)`
  ${(props: CommonThemeProps) => {
    const colors = getColors(props);
    const fontWeights = getFontWeights(props);
    return `
      background-color: ${colors?.gray[200]};
      font-weight: ${fontWeights?.semibold};
    `;
  }}
`;

export const DownloadWrapper = styled.div`
  align-items: center;
  display: flex;
`;

export const TooltipHeaderText = styled.div`
  color: white;
  text-align: center;
`;

export const TooltipDescriptionText = styled.div`
  text-align: center;
  ${(props: CommonThemeProps) => {
    const colors = getColors(props);
    return `
      color: ${colors?.gray[400]};
  `;
  }}
`;

export const StyledFlexChildDiv = styled.div`
  flex: 1 1 0;
  margin: 0 auto;
  max-width: ${MAX_CONTENT_WIDTH}px;
  align-items: stretch;
  flex-direction: column;

  ${(props: CommonThemeProps) => {
    const spaces = getSpaces(props);
    return `
      padding: ${spaces?.xl}px;
    `;
  }}
`;

export const SamplesTable = styled.div`
  ${(props: CommonThemeProps) => {
    const spaces = getSpaces(props);
    return `
      margin-top: ${spaces?.m}px;
    `;
  }}
`;

export const StyledBar = styled.div`
  display: flex;
  justify-content: space-between;
`;

export const StyledUploadButton = styled(Button)`
  ${(props: CommonThemeProps) => {
    const spaces = getSpaces(props);
    return `
      margin-left: ${spaces?.l}px;
    `;
  }}
`;
