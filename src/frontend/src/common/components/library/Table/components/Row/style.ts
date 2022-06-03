import styled from "@emotion/styled";
import { fontHeaderS, fontHeaderXs, getColors, getSpaces } from "czifui";

export const StyledRow = styled.div`
  ${fontHeaderXs}
  display: flex;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);

  ${(props) => {
    const colors = getColors(props);
    const spaces = getSpaces(props);

    return `
      padding: ${spaces?.l}px;

      &:hover {
        background-color: ${colors?.primary[100]};
      }
    `;
  }}
`;

export const StyledHeader = styled.div`
  ${fontHeaderS}
  display: flex;
  margin: 0;

  ${(props) => {
    const colors = getColors(props);
    const spaces = getSpaces(props);

    return `
      color: ${colors?.gray[500]};
      border-bottom: 4px ${colors?.gray[100]} solid;
      padding: ${spaces?.l}px;
    `;
  }}
`;
