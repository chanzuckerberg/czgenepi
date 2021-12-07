import styled from "@emotion/styled";
import { Dropdown, getBorders, getSpaces } from "czifui";

export const StyledDiv = styled.div`
  ${(props) => {
    const spaces = getSpaces(props);

    return `
      padding-right: ${spaces?.l}px;
    `;
  }}
`;

export const StyledDropdown = styled(Dropdown)`
  ${(props) => {
    const spaces = getSpaces(props);
    const borders = getBorders(props);

    return `
      padding-right: ${spaces?.l}px;
      &:hover { 
        border: ${borders?.gray[500]}
      }
    `;
  }}
`;
