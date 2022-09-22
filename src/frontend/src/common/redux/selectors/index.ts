import { RootStateType } from "../index";
import { Pathogen, ReduxNotification } from "../types";

export const selectCurrentGroup = (state: RootStateType): number =>
  state.current.group;

export const selectCurrentPathogen = (state: RootStateType): Pathogen =>
  state.current.pathogen;

export const selectNotifications = (state: RootStateType): ReduxNotification[] =>
  state.notifications;
