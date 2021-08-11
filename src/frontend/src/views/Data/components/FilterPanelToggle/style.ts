import styled from "@emotion/styled";
import { Button } from "@material-ui/core";
import { getColors, getSpacings } from "czifui";
import IconFilters from "src/common/icons/IconFilters.svg";

export const StyledButton = styled(Button)`
  border-radius: 50%;
  flex: 0 0 0;
  min-width: 0;

  ${(props) => {
    const colors = getColors(props);
    const spacings = getSpacings(props);
    return `
      fill: ${colors?.gray[500]};
      /* margin: ${spacings?.xxxs}px;
      padding: ${spacings?.xs}px; */
    `;
  }}
`;

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
