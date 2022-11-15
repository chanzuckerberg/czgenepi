import { ExposedNotificationProps } from "czifui";
import { NotificationComponents } from "src/components/NotificationManager/components/Notification";

export type ComplexActionType<T, U> = (payload: T) => {
  type: CZGEReduxActions;
  payload: U;
};

export type ActionType<T> = ComplexActionType<T, T>;

export enum Pathogen {
  COVID = "SC2",
  MONKEY_POX = "MPX",
}

// export action type for use in reducers and middleware
export enum CZGEReduxActions {
  SET_GROUP_ACTION_TYPE = "group/setGroup",
  SET_PATHOGEN_ACTION_TYPE = "pathogen/setPathogen",
  ADD_NOTIFICATION_ACTION_TYPE = "notifications/addNotification",
  DELETE_NOTIFICATION_ACTION_TYPE = "notifications/deleteNotification",
}

// persisted names are for use in localstorage
export enum ReduxPersistenceTokens {
  GROUP = "currentGroup",
  PATHOGEN = "currentPathogen",
}

/**
 * For notifs, you need to provide either a text string, or a componentKey and relevant props
 */
type NotifTextOrComponent =
  | {
      componentKey: NotificationComponents;
      componentProps?: any;
      text?: never;
    }
  | {
      componentKey?: never;
      componentProps?: never;
      text: string;
    };

export type NewNotification = Omit<
  ExposedNotificationProps,
  "dismissDirection"
> &
  NotifTextOrComponent & {
    dismissDirection?: "right" | "left";
    shouldShowCloseButton?: boolean;
  };

/**
 * Basically, text is if your notification only requires text to be shown. if it needs anything more
 * complicated than that, for example if you need to also display a link or a list of IDs, then you
 * make a component for the content that will be displayed in the notification and use componentKey
 */
export type ReduxNotification = ExposedNotificationProps &
  NewNotification & {
    notifId: EpochTimeStamp; // typically Date.now() because that's a simple way to get unique IDs
  };
