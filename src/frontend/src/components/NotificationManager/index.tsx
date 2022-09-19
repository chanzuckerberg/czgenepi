import { useSelector } from "react-redux";
import { selectNotifications } from "src/common/redux/selectors";
import { ReduxNotification } from "src/common/redux/types";
import { Notification } from "./components/Notification";
import { StyledNotificationContainer } from "./style";

const NotificationsManager = (): JSX.Element => {
  const notifications = useSelector(selectNotifications);

  return (
    <StyledNotificationContainer>
      {notifications.map((notification: ReduxNotification) => {
        <Notification notification={notification} />
      })}
    </StyledNotificationContainer>
  );
};

export default NotificationsManager;
