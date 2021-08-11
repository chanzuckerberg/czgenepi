import styled from "@emotion/styled";
import { getColors, getSpacings } from "czifui";
import IconFilters from "src/common/icons/IconFilters.svg";

export const StyledDiv = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 42px;
  cursor: pointer;

  ${(props) => {
    const spacings = getSpacings(props);

    return `
      margin: ${spacings?.s}px ${spacings?.l}px;
    `;
  }}

  :active {
    ${(props) => {
      const colors = getColors(props);

      return `
        path {
          fill: ${colors?.primary[600]};
        }
      `;
    }}
  }
`;

export const StyledIconFilters = styled(IconFilters)`
  ${(props) => {
    const colors = getColors(props);

    return `
      path {
        fill: ${colors?.primary[400]};
      }
    `;
  }}
`;
