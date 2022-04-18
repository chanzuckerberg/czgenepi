import styled from "@emotion/styled";
import {
  fontBodyXs,
  fontHeaderS,
  fontHeaderXs,
  getColors,
  getSpaces,
} from "czifui";

export const Th = styled.th`
  ${fontHeaderXs}
  ${(props) => {
    const spaces = getSpaces(props);
    const colors = getColors(props);
    return `
      padding: ${spaces?.m}px;
      border-bottom: ${spaces?.xxxs}px solid ${colors?.gray[200]};
    `;
  }}
`;

export const Td = styled.td`
  ${fontBodyXs}
  ${(props) => {
    const spaces = getSpaces(props);
    return `
      padding: ${spaces?.m}px;
    `;
  }}
`;

export const Title = styled.span`
  ${fontHeaderS}
`;

export const FullWidthContainer = styled.div`
  width: 100%;
`;

export const CappedHeightScrollableContainer = styled.div`
  max-height: 200px;
  overflow-y: auto;
  ${(props) => {
    const spaces = getSpaces(props);
    return `
      margin-top: ${spaces?.m}px;
    `;
  }}
`;

// `overflow-wrap: anywhere` prevents crazy long sample IDs overflowing table
export const Table = styled.table`
  width: 100%;
  text-align: left;
  border-spacing: 0;
  overflow-wrap: anywhere;
`;

export const TbodyZebra = styled.tbody`
  tr:nth-of-type(odd) {
    background-color: rgba(0, 0, 0, 0.04);
  }
`;
