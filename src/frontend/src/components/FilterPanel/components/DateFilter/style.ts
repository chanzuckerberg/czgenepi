import styled from "@emotion/styled";
import { fontCapsXxxs, getSpaces, InputDropdown } from "czifui";

export const StyledFilterWrapper = styled.div`
  ${(props) => {
    const spaces = getSpaces(props);
    return `
      margin: ${spaces?.l}px 0;

      &:first-child {
        margin: 0;
      }
    `;
  }}
`;

export const StyledInputDropdown = styled(InputDropdown)`
  ${fontCapsXxxs}
  padding: 0;
  text-align: left;
`;
