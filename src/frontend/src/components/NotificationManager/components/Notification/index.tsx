import { Notification as SDSNotification } from "czifui";
import { FC, ReactNode } from "react";
import { deleteNotification } from "src/common/redux/actions";
import { useDispatch } from "src/common/redux/hooks";
import { ReduxNotification } from "src/common/redux/types";
import { CreateNSTreeFailureNotif } from "../CreateNSTreeFailureNotif";
import { CreateNSTreeSuccessNotif } from "../CreateNSTreeSuccessNotif";
import { DownloadFilesFailureNotif } from "../DownloadFilesFailureNotif";
import { SendInviteFailureNotif } from "../SendInviteFailureNotif";
import { SendInviteSuccessNotif } from "../SendInviteSuccessNotif";
import { UsherPlacementSuccessNotif } from "../UsherPlacementSuccessNotif";

/**
 * We should only store things that are directly serializable (strings, numbers, etc) in redux.
 * This enum exists so we can tell Redux which component to use (by storing a string key)
 * without actually storing the entire component in redux.
 */

export enum NotificationComponents {
  CREATE_NS_TREE_SUCCESS = "createNSTreeSuccess",
  CREATE_NS_TREE_FAILURE = "createNSTreeFailure",
  DOWNLOAD_FILES_FAILURE = "downloadFilesFailure",
  INVITE_USERS_SUCCESS = "inviteUserSuccess",
  INVITE_USERS_FAILURE = "inviteUsersFailure",
  USHER_PLACEMENT_SUCCESS = "usherPlacementSuccess",
}

/**
 * After redux tells us which component to use, we can use the stored key to get access to the
 * component we want to instantiate
 */
const componentMap: Record<Required<NotificationComponents>, FC<any>> = {
  [NotificationComponents.CREATE_NS_TREE_FAILURE]: CreateNSTreeFailureNotif,
  [NotificationComponents.CREATE_NS_TREE_SUCCESS]: CreateNSTreeSuccessNotif,
  [NotificationComponents.DOWNLOAD_FILES_FAILURE]: DownloadFilesFailureNotif,
  [NotificationComponents.INVITE_USERS_SUCCESS]: SendInviteSuccessNotif,
  [NotificationComponents.INVITE_USERS_FAILURE]: SendInviteFailureNotif,
  [NotificationComponents.USHER_PLACEMENT_SUCCESS]: UsherPlacementSuccessNotif,
};

interface Props {
  notification: ReduxNotification;
}

const Notification = ({ notification }: Props): JSX.Element => {
  const dispatch = useDispatch();
  const {
    notifId,
    componentKey,
    componentProps,
    shouldShowCloseButton,
    text,
    ...rest
  } = notification;

  const onDismiss = () => {
    dispatch(deleteNotification(notifId));
  };

  let children: ReactNode = text;

  if (!children && componentKey) {
    const Content = componentMap[componentKey];
    children = <Content onDismiss={onDismiss} {...componentProps} />;
  }

  return (
    <SDSNotification
      {...rest}
      buttonOnClick={shouldShowCloseButton ? onDismiss : undefined}
      onClose={onDismiss}
    >
      {children}
    </SDSNotification>
  );
};

export { Notification };
