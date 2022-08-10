/**
 * Redux middleware allows you to take action whenever specific
 * actions are dispatched. Search google for "redux middleware tutorial"
 * to learn more about how these functions work.
 */

import { AnyAction, Middleware } from "redux";
import { expireAllCaches } from "src/common/queries/groups";
import { setLocalStorage } from "src/common/utils/localStorage";
import { selectCurrentGroup } from "../selectors";
import { CZGEReduxActions, ReduxPersistenceTokens } from "../types";

export const setGroupMiddleware: Middleware =
  ({ getState }) =>
  (next) =>
  (action: AnyAction) => {
    const { type, payload } = action;
    if (type === CZGEReduxActions.SET_GROUP_ACTION_TYPE) {
      setLocalStorage(ReduxPersistenceTokens.GROUP, payload);

      // if the group changes, expire caches, as samples, members
      // and tress for new group must be fetched.
      const state = getState();
      if (selectCurrentGroup(state) !== payload) {
        expireAllCaches();
      }
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
