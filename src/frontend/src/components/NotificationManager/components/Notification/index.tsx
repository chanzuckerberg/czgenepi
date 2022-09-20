import { Notification as SDSNotification } from "czifui";
import { ReactNode } from "react";
import { deleteNotification } from "src/common/redux/actions";
import { useDispatch } from "src/common/redux/hooks";
import { ReduxNotification } from "src/common/redux/types";
import { CreateNSTreeFailureNotif } from "../CreateNSTreeFailureNotif";
import { CreateNSTreeSuccessNotif } from "../CreateNSTreeSuccessNotif";
import { DownloadFilesFailureNotif } from "../DownloadFilesFailureNotif";
import { UsherPlacementSuccessNotif } from "../UsherPlacementSuccessNotif";

export enum NotificationComponents {
  CREATE_NS_TREE_SUCCESS = "createNSTreeSuccess",
  CREATE_NS_TREE_FAILURE = "createNSTreeFailure",
  DOWNLOAD_FILES_FAILURE = "downloadFilesFailure",
  USHER_PLACEMENT_SUCCESS = "usherPlacementSuccess",
}

const componentMap: Require<NotificationComponents, ReactNode> = {
  [NotificationComponents.CREATE_NS_TREE_FAILURE]: CreateNSTreeFailureNotif,
  [NotificationComponents.CREATE_NS_TREE_SUCCESS]: CreateNSTreeSuccessNotif,
  [NotificationComponents.DOWNLOAD_FILES_FAILURE]: DownloadFilesFailureNotif,
  [NotificationComponents.USHER_PLACEMENT_SUCCESS]: UsherPlacementSuccessNotif,
};

interface Props {
  notification: ReduxNotification;
}

const Notification = ({ notification }: Props): JSX.Element => {
  const dispatch = useDispatch();
  const { id, componentKey, shouldShowCloseButton, text, ...rest } = notification;

  const onDismiss = () => {
    dispatch(deleteNotification(id));
  };

  let children = text;

  if (!children) {
    const Content = componentMap[componentKey];
    children = <Content onDismiss={onDismiss} />
  }


  return (
    <SDSNotification {...rest} buttonOnClick={shouldShowCloseButton ? onDismiss : undefined}>
      {children}
    </SDSNotification>
  );
};

export { Notification };
