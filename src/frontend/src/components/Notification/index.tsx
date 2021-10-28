import { ExposedNotificationProps, Notification } from "czifui";
import React from "react";
import { StyledNotificationContainer } from "./style";

const Notifications = (props: ExposedNotificationProps): JSX.Element => {
  return (
    <StyledNotificationContainer>
      <Notification {...props} />
    </StyledNotificationContainer>
  );
};

export default Notifications;
