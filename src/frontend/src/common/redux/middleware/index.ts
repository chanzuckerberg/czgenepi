/**
 * Redux middleware allows you to take action whenever specific
 * actions are dispatched. Search google for "redux middleware tutorial"
 * to learn more about how these functions work.
 */

import { AnyAction, Middleware } from "redux";
import {
  AnalyticsActiveGroupChange,
  EVENT_TYPES,
} from "src/common/analytics/eventTypes";
import {
  analyticsSendUserInfo,
  analyticsTrackEvent,
} from "src/common/analytics/methods";
import { expireAllCaches } from "src/common/queries/groups";
import { FALLBACK_GROUP_ID } from "src/common/redux";
import { setLocalStorage } from "src/common/utils/localStorage";
import { getCurrentUserInfo } from "src/common/utils/userInfo";
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
      const currentGroupId = selectCurrentGroup(state);
      if (currentGroupId !== payload) {
        expireAllCaches();

        // Update analytics with the group user is changing to.
        // Only concerned with change if user/group info fully initialized.
        const currentUserInfo = getCurrentUserInfo();
        if (currentUserInfo && currentGroupId !== FALLBACK_GROUP_ID) {
          analyticsTrackEvent<AnalyticsActiveGroupChange>(
            EVENT_TYPES.ACTIVE_GROUP_CHANGE,
            {
              previous_group_id: currentGroupId,
              new_group_id: payload,
            }
          );
          // We also update user info to record that user's group has changed.
          // Need to explicitly set new group ID since redux is doing update.
          analyticsSendUserInfo(currentUserInfo, payload);
        }
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
