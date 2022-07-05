/**
 * Redux middleware allows you to take action whenever specific
 * actions are dispatched. Search google for "redux middleware tutorial"
 * to learn more about how these functions work.
 */

import { AnyAction, Middleware } from "redux";
import { setLocalStorage } from "src/common/utils/localStorage";
import {
  groupPersistedName,
  pathogenPersistedName,
  setGroupActionType,
  setPathogenActionType,
} from "../actions";

export const setGroupMiddleware: Middleware =
  () => (next) => (action: AnyAction) => {
    const { type, payload } = action;
    if (type === setGroupActionType) {
      setLocalStorage(groupPersistedName, payload);
    }

    return next(action);
  };

export const setPathogenMiddleware: Middleware =
  () => (next) => (action: AnyAction) => {
    const { type, payload } = action;
    if (type === setPathogenActionType) {
      setLocalStorage(pathogenPersistedName, payload);
    }

    return next(action);
  };
