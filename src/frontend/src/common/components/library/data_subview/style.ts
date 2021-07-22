import styled from "@emotion/styled";
import { getColors, getSpacings } from "czifui";
import DownloadImage from "./IconDownload.svg";

export const StyledDiv = styled.div`
  display: inline;
  font-weight: 550;

  ${(props) => {
    const spacings = getSpacings(props);
    const colors = getColors(props);
    return `
    padding: ${spacings?.l}px;
    margin-right: ${spacings?.m}px;
    color: black;
    border-right: 1px solid ${colors?.gray[500]};
`;
  }}
`;

export const DownloadWrapper = styled.div`
  ${(props) => {
    const spacings = getSpacings(props);
    return `
      padding-bottom: ${spacings?.xxl}px;
    `;
  }}
`;

export const StyledDownloadImage = styled(DownloadImage)`
  width: 32px;
  height: 32px;
  viewBox: 0 0 32 32;
  ${(props) => {
    const colors = getColors(props);
    const spacings = getSpacings(props);
    console.log("COLORS: ", colors);
    return `
      fill: ${colors?.primary[600]};
      padding-top: ${spacings?.xs}px;
    `;
  }}
`;
