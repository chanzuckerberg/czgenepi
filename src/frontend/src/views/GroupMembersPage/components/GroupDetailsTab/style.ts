import styled from "@emotion/styled";
import {
  fontBodyM,
  fontBodyS,
  fontHeaderM,
  fontHeaderXl,
  getColors,
  getSpaces,
} from "czifui";

export const DetailsDisplay = styled.div`
  ${fontBodyM}
  ${(props) => {
    const colors = getColors(props);
    const spaces = getSpaces(props);

    return `
      padding: ${spaces?.l}px;
      background-color: ${colors?.gray[100]};
      margin-bottom: ${spaces?.xl}px;
      white-space: pre-wrap;
    `;
  }}
`;

export const DetailsHeader = styled.div`
  ${fontHeaderXl}
  order: 1;

  ${(props) => {
    const spaces = getSpaces(props);
    return `
      margin-bottom: ${spaces?.l}px;
    `;
  }}
`;

export const DetailSection = styled.div``;

export const DetailSubheader = styled.div`
  ${fontHeaderM}
`;

export const Text = styled.div`
  ${fontBodyS}

  ${(props) => {
    const spaces = getSpaces(props);
    return `
      margin-top: ${spaces?.s}px;
      margin-bottom: ${spaces?.l}px;
    `;
  }}
`;

