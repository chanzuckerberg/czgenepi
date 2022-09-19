import { ActionType, CZGEReduxActions, Pathogen, ReduxNotification } from "../types";

export const setGroup: ActionType<number> = (groupId) => ({
  type: CZGEReduxActions.SET_GROUP_ACTION_TYPE,
  payload: groupId,
});

export const setPathogen: ActionType<Pathogen> = (pathogen) => ({
  type: CZGEReduxActions.SET_PATHOGEN_ACTION_TYPE,
  payload: pathogen,
});

export const addNotification: ActionType<ReduxNotification> = (notification) => ({
  type: CZGEReduxActions.ADD_NOTIFICATION_ACTION_TYPE,
  payload: {
    buttonText: "DISMISS",
    dismissDirection: "right",
    intent: "error",
    ...notification
  },
});

export const deleteNotification: ActionType<number> = (notificationId) => ({
  type: CZGEReduxActions.DELETE_NOTIFICATION_ACTION_TYPE,
  payload: notificationId,
});