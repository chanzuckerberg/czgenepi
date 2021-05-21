import styled from "@emotion/styled";
import { getColors, getSpacings, Props } from "czifui";

export const TableRow = styled.div`
  display: flex;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);

  ${(props) => {
    const colors = getColors(props);

    return `
      &:hover {
        background-color: ${colors?.primary[100]};
      }
    `;
  }}
`;

export const RowContent = styled.div`
  display: flex;
  align-items: center;
  width: 100%;

  ${(props) => {
    const spacings = getSpacings(props);

    return `
      padding: ${spacings?.l}px 0;
      margin-right: ${spacings?.m}px;
  `;
  }}
`;

export const icon = (props: Props) => {
  const colors = getColors(props);
  const spacings = getSpacings(props);

  return `
    margin: 0 ${spacings?.l}px;
    fill: ${colors?.gray[500]};
  `;
};
