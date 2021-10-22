import { Notification, NotificationProps } from "czifui";
import React from "react";
import { StyledNotifContainer } from "./style";

const Notifications = (props: NotificationProps): JSX.Element => {
  return (
    <StyledNotifContainer>
      <Notification {...props} />
    </StyledNotifContainer>
  );
};

export default Notifications;
