import { Notification as SDSNotification } from "czifui";
import { deleteNotification } from "src/common/redux/actions";
import { useDispatch } from "src/common/redux/hooks";
import { ReduxNotification } from "src/common/redux/types";

interface Props {
  notification: ReduxNotification;
}

export const Notification = (notification: Props): JSX.Element => {
  const dispatch = useDispatch();
  const { id, content, shouldShowCloseButton, ...rest } = notification;

  const onDismiss = () => {
    dispatch(deleteNotification(id));
  };

  return (
    <SDSNotification {...rest} buttonOnClick={shouldShowCloseButton && onDismiss}>
      {() => content({ onDismiss })}
    </SDSNotification>
  );
};
