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

  ${(props) => {
    const spaces = getSpaces(props);
    return `
      margin-bottom: ${spaces?.l}px;
      width: 100%;
    `;
  }}
`;

export const DetailSection = styled.div`
  @media only screen and (min-width: 768px) {
    ${(props) => {
      const colors = getColors(props);
      const spaces = getSpaces(props);
      return `
        &:first-child {
          padding-right: ${spaces?.xl}px;
          border-right: 1px solid ${colors?.gray[300]};
        }

        &:last-child {
          padding-left: ${spaces?.xl}px;
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
    flex-wrap: wrap;
  }
`;

export const Content = styled.div`
  @media only screen and (min-width: 768px) {
    display: flex;
  }
`;
