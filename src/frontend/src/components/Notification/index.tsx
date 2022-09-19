import { Notification } from "czifui";
import { useDispatch, useSelector } from "react-redux";
import { deleteNotification } from "src/common/redux/actions";
import { selectNotifications } from "src/common/redux/selectors";
import { ReduxNotification } from "src/common/redux/types";
import { StyledNotificationContainer } from "./style";

const NotificationsManager = (): JSX.Element => {
  const dispatch = useDispatch();
  const notifications = useSelector(selectNotifications);

  return (
    <StyledNotificationContainer>
      {notifications.map((notification: ReduxNotification) => {
        const { id, content, ...rest } = notification;
        const onClick = () => {
          dispatch(deleteNotification(id));
        };

        <Notification {...rest} buttonOnClick={onClick}>
          {content}
        </Notification>
      })}
    </StyledNotificationContainer>
  );
};

export default  NotificationsManager;
