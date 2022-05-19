import styled from "@emotion/styled";
import {
  Chip,
  fontHeaderXs,
  getColors,
  getCorners,
  getFontWeights,
  getSpaces,
} from "czifui";

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
  align-items: stretch;
  flex-direction: column;

  ${(props) => {
    const spaces = getSpaces(props);
    return `
      padding: ${spaces?.xl}px;
    `;
  }}
`;

export const SearchBar = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  width: 100%;

  ${(props) => {
    const colors = getColors(props);
    const corners = getCorners(props);
    const spaces = getSpaces(props);

    return `
      margin-bottom: ${spaces?.xxl}px;

      input {
        border-radius: ${corners?.l}px !important;

        &:hover {
          border-color: ${colors?.gray[400]};
        }

        &:focus {
          border-color: ${colors?.primary[400]};
        }
      }
    `;
  }}
`;

export const SearchInput = styled.div`
  width: 25%;
  min-width: 20em;

  > div {
    width: 100%;
  }
`;

export const SamplesTable = styled.div`
  ${(props) => {
    const spaces = getSpaces(props);
    return `
      margin-top: ${spaces?.m}px;
    `;
  }}
`;
