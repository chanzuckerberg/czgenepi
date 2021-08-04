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
  float: left;
  ${(props) => {
    const spacings = getSpacings(props);
    const fontWeights = getFontWeights(props);
    return `
    margin-left: ${spacings?.m}px;
    margin-top: ${spacings?.l}px;
    font-weight: ${fontWeights?.semibold}; 
    color: black;
    `;
  }}
`;

export const Divider = styled.div`
  height: 28px;
  float: left;

  ${(props) => {
    const spacings = getSpacings(props);
    const colors = getColors(props);
    return `
    margin-top: ${spacings?.s}px;
    margin-left: ${spacings?.xl}px;
    border-right: 1px solid ${colors?.gray[500]};
    `;
  }}
`;

export const StyledChip = styled(Chip)`
  float: left;
  ${(props) => {
    const spacings = getSpacings(props);
    const colors = getColors(props);
    const fontWeights = getFontWeights(props);
    return `
      margin-top: ${spacings?.s}px;
      background-color: ${colors?.gray[200]};
      font-weight: ${fontWeights?.semibold}; 
    `;
  }}
`;

export const DownloadButtonWrapper = styled.div`
  width: 20em;
  float: right;
`;

export const DownloadWrapper = styled.div`
  float: right;
  display: inline-block;
  ${(props) => {
    const spacings = getSpacings(props);
    return `
      padding-bottom: ${spacings?.xxl}px;
    `;
  }}
`;

export const StyledSpan = styled.span`
  display: flex;
`;

export const StyledButton = styled(Button)`
  flex: 0 0 0;
  width: 42px;
  height: 42px;
  border-radius: 50%;
  ${(props) => {
    const colors = getColors(props);
    const spacings = getSpacings(props);
    return `
      fill: ${colors?.gray[300]};
      margin-top: ${spacings?.l}px;
      // margin-left: ${spacings?.xxs}px;
    `;
  }}
`;

export const StyledDownloadImage = styled(DownloadImage)`
  width: 32px;
  height: 32px;
  float: left;
  ${(props) => {
    const colors = getColors(props);
    const spacings = getSpacings(props);
    return `
      fill: ${colors?.primary[400]};
      margin-top: ${spacings?.xxxs}px;
      // margin-left: ${spacings?.s}px;
    `;
  }}
`;

export const StyledDownloadDisabledImage = styled(DownloadImage)`
  width: 32px;
  height: 32px;
  float: left;
  ${(props) => {
    const colors = getColors(props);
    const spacings = getSpacings(props);
    return `
        fill: ${colors?.gray[300]};
        margin-top: ${spacings?.xxxs}px;
        // margin-left: ${spacings?.s}px;
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
