import styled from "@emotion/styled";
import { Chip, getColors, getSpacings, InputDropdown } from "czifui";

export const StyledFilterPanel = styled.div`
  ${(props) => {
    const { isOpen } = props;
    const colors = getColors(props);
    const spacings = getSpacings(props);
    return `
      border-right: ${spacings?.xxxs}px ${colors?.gray[200]} solid;
      display: ${isOpen ? "block" : "none"};
      padding: ${spacings?.xl}px;
      width: 240px;
    `;
  }}
`;

export const StyledInputDropdown = styled(InputDropdown)`
  padding: 0;
  text-align: left;
  text-transform: uppercase;
`;

export const StyledFilterWrapper = styled.div`
  ${(props) => {
    const spacings = getSpacings(props);
    return `
      margin: ${spacings?.l}px 0;

      &:first-child {
        margin: 0;
      }
    `;
  }}
`;

export const StyledChip = styled(Chip)`
  ${(props) => {
    const spacings = getSpacings(props);
    return `
      margin: ${spacings?.xxs}px ${spacings?.xxs}px 0 0;
    `;
  }}
`;
