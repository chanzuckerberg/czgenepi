import { ExposedNotificationProps } from "czifui";
import React from "react";

export type ActionType<T> = (payload?: T) => {
  type: CZGEReduxActions;
  payload?: T;
};

export enum Pathogen {
  COVID = "covid",
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

export type ReduxNotification = ExposedNotificationProps & {
  id: number;
  content: React.ReactNode;
  shouldShowCloseButton?: boolean;
};
