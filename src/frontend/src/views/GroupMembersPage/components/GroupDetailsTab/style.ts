import styled from "@emotion/styled";
import {
  fontBodyM,
  fontBodyS,
  fontHeaderM,
  fontHeaderXl,
  getColors,
  getSpaces,
} from "czifui";

export const DetailDisplay = styled.div`
  ${fontBodyM}
  ${(props) => {
    const colors = getColors(props);
    const spaces = getSpaces(props);

    return `
      padding: ${spaces?.l}px;
      background-color: ${colors?.gray[100]};
      margin-bottom: ${spaces?.xl}px;
      white-space: pre-wrap;
      overflow-wrap: break-word;
    `;
  }}
`;

export const DetailHeader = styled.div`
  ${fontHeaderXl}
  order: 1;

  ${(props) => {
    const spaces = getSpaces(props);
    return `
      margin-bottom: ${spaces?.l}px;
    `;
  }}
`;

export const DetailSection = styled.div`
  @media only screen and (min-width: 768px) {
    ${(props) => {
      const spaces = getSpaces(props);
      return `
        &:first-child {
          margin-right: ${spaces?.xl}px;
        }

        &:last-child {
          margin-right: ${spaces?.xl}px;
        }
      `;
    }}
  }
`;

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

export const DetailPage = styled.div`
  @media only screen and (min-width: 768px) {
    display: flex;
  }
`;
