import styled from "@emotion/styled";
import { fontHeaderXs, getColors, getSpaces, InputDropdown } from "czifui";
import { NewTabLink } from "src/common/components/library/NewTabLink";

export const StyledContainer = styled.div`
  ${(props) => {
    const spaces = getSpaces(props);
    return `
      margin-top: ${spaces?.l}px;
    `;
  }}
`;

export const StyledExplainerTitle = styled.div`
  ${fontHeaderXs}
  display: flex;
  align-items: center;
  color: black;
`;

export const StyledFiltersSection = styled.div`
  display: flex;
  flex-direction: row;
  ${(props) => {
    const spaces = getSpaces(props);
    return `
      margin-top: ${spaces?.m}px;
    `;
  }}
`;

export const StyledFilterGroup = styled.div`
  ${(props) => {
    const spaces = getSpaces(props);
    return `
      margin-left: ${spaces?.xl}px;
    `;
  }}
`;

export const StyledFilterGroupName = styled.p`
  ${fontHeaderXs}
  color: black;
`;

export const StyledNewTabLink = styled(NewTabLink)`
  ${(props) => {
    const colors = getColors(props);

    return `
      &:hover {
        color: ${colors?.primary[600]};
        text-decoration: none;
      }
    `;
  }}
`;

export const StyledInputDropdown = styled(InputDropdown)`
  width: 200px;
`;
