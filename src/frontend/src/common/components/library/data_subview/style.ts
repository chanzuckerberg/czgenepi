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
    border-right: 2px solid ${colors?.gray[500]};
`;
  }}
`;

export const ImageWrapper = styled.div`
  display: inline;
  align-items: center;
  justify-content: center;
  ${(props) => {
    const spacings = getSpacings(props);
    return `
      padding-top: ${spacings?.xl}px;
    `;
  }}
`;

export const StyledDownloadImage = styled(DownloadImage)`
  ${(props) => {
    const colors = getColors(props);
    const spacings = getSpacings(props);
    return `
      fill: ${colors?.primary[400]};
      padding-top: ${spacings?.xs}px;
    `;
  }}
`;
