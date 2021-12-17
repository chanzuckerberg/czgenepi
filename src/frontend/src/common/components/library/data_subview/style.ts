import styled from "@emotion/styled";
import {
  Chip,
  fontHeaderXs,
  getColors,
  getFontWeights,
  getSpaces,
} from "czifui";
import DownloadImage from "src/common/icons/IconDownloadLarge.svg";

export const StyledDiv = styled.div`
  ${fontHeaderXs}
  ${(props) => {
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

  ${(props) => {
    const spaces = getSpaces(props);
    const colors = getColors(props);
    return `
    margin-left: ${spaces?.xl}px;
    border-right: 1px solid ${colors?.gray[500]};
    `;
  }}
`;

export const StyledChip = styled(Chip)`
  ${(props) => {
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

export const StyledDownloadImage = styled(DownloadImage)`
  width: 32px;
  height: 32px;
  ${(props) => {
    const colors = getColors(props);
    return `
      fill: ${colors?.primary[400]};
    `;
  }}
`;

export const StyledDownloadDisabledImage = styled(DownloadImage)`
  width: 32px;
  height: 32px;
  ${(props) => {
    const colors = getColors(props);
    return `
        fill: ${colors?.gray[300]};
    `;
  }}
`;

export const TooltipHeaderText = styled.div`
  color: white;
  text-align: center;
`;

export const TooltipDescriptionText = styled.div`
  text-align: center;
  ${(props) => {
    const colors = getColors(props);
    return `
      color: ${colors?.gray[400]};
  `;
  }}
`;

export const StyledFlexChildDiv = styled.div`
  flex: 1 1 0;
  margin: 0 auto;
  max-width: 1308px;
`;
