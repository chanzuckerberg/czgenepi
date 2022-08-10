import styled from "@emotion/styled";
import { getSpaces } from "czifui";

export const StyledActionWrapper = styled.div`
  ${(props) => {
    const spaces = getSpaces(props);

    return `
      padding: 0 ${spaces?.m}px;

      &:last-child {
        padding-right: 0;
      }
    `;
  }}
`;

export const StyledTreeActionMenu = styled.div`
  display: flex;
  align-items: center;
  justify-content: right;
  width: 150px;

  ${(props) => {
    const spaces = getSpaces(props);

    return `
      margin: 0 ${spaces?.m}px;
    `;
  }}
`;
