import styled from "@emotion/styled";
import {
  Button,
  Chip,
  fontBodyXxs,
  fontHeaderXs,
  getColors,
  getFontWeights,
  getSpacings,
} from "czifui";
import { NewTabLink } from "src/common/components/library/NewTabLink";
import DownloadImage from "src/common/icons/IconDownload.svg";

export const StyledDiv = styled.div`
  ${fontHeaderXs}
  ${(props) => {
    const spacings = getSpacings(props);
    const fontWeights = getFontWeights(props);
    return `
    margin-left: ${spacings?.m}px;
    font-weight: ${fontWeights?.semibold};
    color: black;
    `;
  }}
`;

export const Divider = styled.div`
  height: 28px;

  ${(props) => {
    const spacings = getSpacings(props);
    const colors = getColors(props);
    return `
    margin-left: ${spacings?.xl}px;
    border-right: 1px solid ${colors?.gray[500]};
    `;
  }}
`;

export const StyledButton = styled(Button)`
  ${fontBodyXxs}
  color: black;
  &:hover {
    background-color: transparent;
  }
  ${(props) => {
    const spacings = getSpacings(props);
    const fontWeights = getFontWeights(props);
    return `
      font-weight: ${fontWeights?.semibold};
      margin-top: ${spacings?.xs}px;
      margin-left: 0px;
      padding-left: 0px;
    `;
  }}
`;

export const CreateTreeModalDiv = styled.div`
  display: flex;
  flex-direction: column;
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

export const BoldText = styled.div`
  ${(props) => {
    const fontWeights = getFontWeights(props);
    return `
        font-weight: ${fontWeights?.semibold};
      `;
  }}
`;

export const StyledNewTabLink = styled(NewTabLink)`
  color: black;
  border-bottom: 1px dotted black;
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
