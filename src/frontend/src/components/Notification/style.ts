import styled from "@emotion/styled";
import { getSpaces } from "czifui";

export const StyledNotificationContainer = styled.div`
  position: fixed;

  ${(props) => {
    const spaces = getSpaces(props);
    return `
      right: ${spaces?.l}px;
      top: ${spaces?.l}px;
    `;
  }}
`;
