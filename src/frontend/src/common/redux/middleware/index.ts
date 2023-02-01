/**
 * Redux middleware allows you to take action whenever specific
 * actions are dispatched. Search google for "redux middleware tutorial"
 * to learn more about how these functions work.
 */

import { forEach } from "lodash";
import { AnyAction, Middleware } from "redux";
import {
  AnalyticsActiveGroupChange,
  EVENT_TYPES,
} from "src/common/analytics/eventTypes";
import {
  analyticsSendUserInfo,
  analyticsTrackEvent,
} from "src/common/analytics/methods";
import { getCurrentUserInfo } from "src/common/queries/auth";
import { expireAllCaches } from "src/common/queries/groups";
import { USE_LINEAGES_INFO_QUERY_KEY } from "src/common/queries/lineages";
import { USE_LOCATIONS_INFO_QUERY_KEY } from "src/common/queries/locations";
import { USE_PHYLO_RUN_INFO } from "src/common/queries/phyloRuns";
import { queryClient } from "src/common/queries/queryClient";
import { USE_SAMPLE_INFO } from "src/common/queries/samples";
import { FALLBACK_GROUP_ID } from "src/common/redux";
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

const expirePathogenCaches = async (): Promise<void> => {
  const queriesToRefetch = [
    USE_PHYLO_RUN_INFO,
    USE_SAMPLE_INFO,
    USE_LINEAGES_INFO_QUERY_KEY,
    // (ehoops) Refetching locations is somewhat expensive. If users often
    // switch between pathogens, we should cache this per pathogen.
    USE_LOCATIONS_INFO_QUERY_KEY,
  ];

  forEach(queriesToRefetch, async (q) => {
    await queryClient.invalidateQueries([q]);
    await queryClient.fetchQuery([q]);
  });
};

export const setPathogenMiddleware: Middleware =
  () => (next) => (action: AnyAction) => {
    const { type, payload } = action;
    if (type === CZGEReduxActions.SET_PATHOGEN_ACTION_TYPE) {
      setLocalStorage(ReduxPersistenceTokens.PATHOGEN, payload);
      expirePathogenCaches();
    }

    return next(action);
  };
