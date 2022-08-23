import { ExposedNotificationProps, Notification } from "czifui";
import { StyledNotificationContainer } from "./style";

const Notifications = (props: ExposedNotificationProps): JSX.Element => {
  return (
    <StyledNotificationContainer>
      <Notification {...props} />
    </StyledNotificationContainer>
  );
};

export default Notifications;
