import { useSelector } from "react-redux";
import { selectNotifications } from "src/common/redux/selectors";
import { ReduxNotification } from "src/common/redux/types";
import { Notification, NotificationComponents } from "./components/Notification";
import { StyledNotificationContainer } from "./style";

const NotificationsManager = (): JSX.Element => {
  const notifications = useSelector(selectNotifications);

  return (
    <StyledNotificationContainer>
      {notifications.map((notification: ReduxNotification) => (
        <Notification key={notification.reduxId} notification={notification} />
      ))}
    </StyledNotificationContainer>
  );
};

export { NotificationsManager };
