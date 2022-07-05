/**
 * Redux middleware allows you to take action whenever specific
 * actions are dispatched. Search google for "redux middleware tutorial"
 * to learn more about how these functions work.
 */

import { AnyAction, Middleware } from "redux";
import { setLocalStorage } from "src/common/utils/localStorage";

export const setGroupMiddleware: Middleware =
  () => (next) => (action: AnyAction) => {
    const { type, payload } = action;
    if (type === CZGEReduxActions.SET_GROUP_ACTION_TYPE) {
      setLocalStorage(ReduxPersistenceTokens.GROUP, payload);
    }

    return next(action);
  };

export const setPathogenMiddleware: Middleware =
  () => (next) => (action: AnyAction) => {
    const { type, payload } = action;
    if (type === CZGEReduxActions.SET_PATHOGEN_ACTION_TYPE) {
      setLocalStorage(ReduxPersistenceTokens.PATHOGEN, payload);
    }

    return next(action);
  };
