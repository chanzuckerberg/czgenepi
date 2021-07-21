import styled from "@emotion/styled";
import {
  Alert,
  Button,
  fontBodyXs,
  getColors,
  getSpacings,
  Link,
} from "czifui";
import DownloadImage from "./IconDownload.svg";

export const StyledDiv = styled.div`
  display: inline;
  font-weight: 550;

  ${(props) => {
    const spacings = getSpacings(props);
    return `
    margin-left: ${spacings?.m}px;
    color: black;
    `;
  }}
`;

export const Divider = styled.div`
  height: 19px;

  ${(props) => {
    const spacings = getSpacings(props);
    const colors = getColors(props);
    return `
    margin-right: ${spacings?.m}px;
    margin-left: ${spacings?.xl}px;
    border-right: 1px solid ${colors?.gray[500]};
    `;
  }}
`;

export const DownloadButtonWrapper = styled.div`
  width: 20em;
  float: right;
`;

export const DownloadWrapper = styled.div`
  float: right;
  ${(props) => {
    const spacings = getSpacings(props);
    return `
      padding-bottom: ${spacings?.xxl}px;
    `;
  }}
`;

export const StyledDownloadImage = styled(DownloadImage)`
  width: 50px;
  height: 32px;
  ${(props) => {
    const colors = getColors(props);
    return `
      fill: ${colors?.primary[600]};
    `;
  }}
`;

export const StyledDownloadDisabledImage = styled(DownloadImage)`
  width: 50px;
  height: 32px;
  ${(props) => {
    const colors = getColors(props);
    const spacings = getSpacings(props);
    return `
        fill: ${colors?.gray[300]};
        padding-left: ${spacings?.m}px;
    `;
  }}
`;

export const BoldText = styled.div`
  font-weight: 600;
`;

export const DismissButton = styled(Button)`
  ${fontBodyXs}
  font-weight: 600;
  &:hover {
    background-color: transparent;
  }
  ${(props) => {
    const spacings = getSpacings(props);
    return `
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
