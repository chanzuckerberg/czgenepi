import { ExposedNotificationProps, Notification } from "czifui";
import React from "react";
import { StyledNotifContainer } from "./style";

const Notifications = (props: ExposedNotificationProps): JSX.Element => {
  return (
    <StyledNotifContainer>
      <Notification {...props} />
    </StyledNotifContainer>
  );
};

export default Notifications;
