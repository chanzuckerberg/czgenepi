import styled from "@emotion/styled";
import { getColors, getSpacings, InputDropdown } from "czifui";

export const StyledFilterPanel = styled.div`
  ${(props) => {
    const colors = getColors(props);
    const spacings = getSpacings(props);
    return `
      border-right: ${spacings?.xxxs}px ${colors?.gray[200]} solid;
      padding: ${spacings?.xl}px;
      min-width: 240px;
    `;
  }}
`;

export const StyledInputDropdown = styled(InputDropdown)`
  text-align: left;
  text-transform: uppercase;

  ${(props) => {
    const spacings = getSpacings(props);
    return `
      margin: ${spacings?.xxxs}px 0;
    `;
  }}
`;
