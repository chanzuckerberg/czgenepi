/**
 * Redux middleware allows you to take action whenever specific
 * actions are dispatched. Search google for "redux middleware tutorial"
 * to learn more about how these functions work.
 */

import { AnyAction, Middleware } from "redux";
import { setLocalStorage } from "src/common/utils/localStorage";
import { groupPersistedName, setGroupActionType } from "../actions";

export const setGroupMiddleware: Middleware =
  () => (next) => (action: AnyAction) => {
    if (action.type === setGroupActionType) {
      setLocalStorage(groupPersistedName, action.payload);
    }

    return next(action);
  };
