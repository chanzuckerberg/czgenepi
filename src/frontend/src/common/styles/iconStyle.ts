// includes shared styles for icons
import styled from "@emotion/styled";
import { getColors, getSpaces } from "czifui";

export const StyledEditIconWrapper = styled.div`
  ${(props) => {
    const spaces = getSpaces(props);
    return `
      margin-right: ${spaces?.m}px;

    `;
  }}

  svg {
    fill: black;
  }
`;

export const StyledTrashIconWrapper = styled.div`
  ${(props) => {
    const colors = getColors(props);
    const spaces = getSpaces(props);
    return `
      margin-right: ${spaces?.m}px;
      svg {
        fill: ${colors?.error[400]};
      }
    `;
  }}
`;
