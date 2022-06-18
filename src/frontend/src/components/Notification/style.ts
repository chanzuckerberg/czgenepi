import styled from "@emotion/styled";
import { getSpaces } from "czifui";

// TODO (mlila): when we add FE state management, we should have one piece of
// TODO          state that keeps track of all current notifications, and then have only
// TODO          one notif container for the whole app, so all notifications automatically
// TODO          stack nicely.
export const StyledNotificationContainer = styled.div`
  position: fixed;
  display: flex;
  flex-direction: column;

  ${(props) => {
    const spaces = getSpaces(props);
    return `
      right: ${spaces?.l}px;
      top: ${spaces?.l}px;
      z-index: 1300;
    `;
  }}
`;
