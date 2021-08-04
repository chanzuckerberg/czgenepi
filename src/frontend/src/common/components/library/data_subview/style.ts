import styled from "@emotion/styled";
import {
  Alert,
  Button,
  Chip,
  fontBodyXs,
  fontHeaderXs,
  getColors,
  getFontWeights,
  getSpacings,
  Link,
} from "czifui";
import DownloadImage from "./IconDownload.svg";

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

export const StyledChip = styled(Chip)`
  ${(props) => {
    const spacings = getSpacings(props);
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
  ${(props) => {
    const spacings = getSpacings(props);
    return `
      padding-bottom: ${spacings?.xxl}px;
    `;
  }}
`;

export const StyledSpan = styled.span`
  display: flex;
  ${(props) => {
    const spacings = getSpacings(props);
    return `
      margin-left: ${spacings?.m}px;
    `;
  }}
`;

export const StyledButton = styled(Button)`
  border-radius: 50%;
  flex: 0 0 0;
  min-width: unset;
  ${(props) => {
    const colors = getColors(props);
    const spacings = getSpacings(props);
    return `
      fill: ${colors?.gray[300]};
      margin: ${spacings?.xxxs}px;
      padding: ${spacings?.xs}px;
    `;
  }}
`;

export const StyledDownloadImage = styled(DownloadImage)`
  width: 32px;
  height: 32px;
  ${(props) => {
    const colors = getColors(props);
    const spacings = getSpacings(props);
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
    const spacings = getSpacings(props);
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

export const DismissButton = styled(Button)`
  ${fontBodyXs}
  &:hover {
    background-color: transparent;
  }
  ${(props) => {
    const spacings = getSpacings(props);
    const fontWeights = getFontWeights(props);
    return `
      font-weight: ${fontWeights?.semibold};
      margin-top: ${spacings?.xl}px;
      margin-left: 0px;
      padding-left: 0px;
    `;
  }}
`;

export const StyledAlert = styled(Alert)`
  position: absolute;
  z-index: 1;
  box-shadow: 5px 10px;
  width: 500px;
  margin-top: -30px;
  right: 15px;
`;

export const StyledLink = styled(Link)`
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
