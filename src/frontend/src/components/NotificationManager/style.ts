import styled from "@emotion/styled";
import { CommonThemeProps, getSpaces } from "czifui";

export const StyledNotificationContainer = styled.div`
  position: fixed;
  display: flex;
  flex-direction: column;

  ${(props: CommonThemeProps) => {
    const spaces = getSpaces(props);
    return `
      right: ${spaces?.l}px;
      top: ${spaces?.l}px;
      z-index: 1300;
    `;
  }}
`;
