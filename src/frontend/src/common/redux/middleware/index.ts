/**
 * Redux middleware allows you to take action whenever specific
 * actions are dispatched. Search google for "redux middleware tutorial"
 * to learn more about how these functions work.
 */

import { Action, Store } from "redux";
import { setLocalStorage } from "src/common/utils/localStorage";
import { setGroupActionType, groupPersistedName } from "../actions";

export const setGroupMiddleware =
  (storeAPI: Store) =>
  (next) =>
  (action: Action) => {
    if (action.type === setGroupActionType) {
      setLocalStorage(groupPersistedName, action.payload);
    }

    return next(action);
  };
