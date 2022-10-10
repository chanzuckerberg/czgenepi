import styled from "@emotion/styled";
import { CommonThemeProps, fontHeaderXs, getSpaces } from "czifui";

export const FilterContainer = styled.div`
  ${(props: CommonThemeProps) => {
    const spaces = getSpaces(props);
    return `
      margin-top: ${spaces?.l}px;
    `;
  }}
`;

export const StyledTitleContainer = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
`;

export const StyledExplainerTitle = styled.div`
  ${fontHeaderXs}
  display: flex;
  align-items: center;
  color: black;
  ${(props: CommonThemeProps) => {
    const spaces = getSpaces(props);
    return `
      margin: ${spaces?.xxs}px 0;
    `;
  }}
`;
