import { useRouter } from "next/router";
import { useEffect } from "react";
import {
  useMutation,
  UseMutationResult,
  useQuery,
  useQueryClient,
  UseQueryResult,
} from "react-query";
import { useSelector } from "react-redux";
import { analyticsSendUserInfo } from "src/common/analytics/methods";
import ENV from "src/common/constants/ENV";
import { queryClient } from "src/common/queries/queryClient";
import { API, DEFAULT_PUT_OPTIONS, getBackendApiJson } from "../api";
import { selectCurrentGroup } from "../redux/selectors";
import { ROUTES } from "../routes";
import { setValidGroup } from "../utils/groupUtils";
import { ENTITIES } from "./entities";
import {
  USE_GROUP_INFO,
  USE_GROUP_INVITATION_INFO,
  USE_GROUP_MEMBER_INFO,
} from "./groups";

const { API_URL } = ENV;

export const USE_USER_INFO = {
  entities: [ENTITIES.USER_INFO],
  id: "userInfo",
};

export interface RawUserRequest {
  id: number;
  name: string;
  groups: UserGroup[];
  agreed_to_tos: boolean;
  acknowledged_policy_version: string | null; // Date or null in DB. ISO 8601: "YYYY-MM-DD"
  split_id: string;
  analytics_id: string;
  group_admin: boolean;
}

export const mapUserData = (obj: RawUserRequest): User => {
  return {
    acknowledgedPolicyVersion: obj.acknowledged_policy_version,
    agreedToTos: obj.agreed_to_tos,
    analyticsId: obj.analytics_id,
    groups: obj.groups,
    id: obj.id,
    name: obj.name,
    splitId: obj.split_id,
  };
};

export const fetchUserInfo = (): Promise<RawUserRequest> => {
  return getBackendApiJson(API.USERDATA);
};

const updateUserInfo = (user: Partial<RawUserRequest>): Promise<Response> => {
  return fetch(API_URL + API.USERDATA, {
    ...DEFAULT_PUT_OPTIONS,
    body: JSON.stringify(user),
  });
};

export function useUpdateUserInfo(): UseMutationResult<
  Response,
  unknown,
  Partial<RawUserRequest>,
  unknown
> {
  const queryClient = useQueryClient();

  return useMutation(updateUserInfo, {
    onSuccess: async () => {
      await queryClient.invalidateQueries([
        USE_USER_INFO,
        USE_GROUP_INFO,
        USE_GROUP_INVITATION_INFO,
        USE_GROUP_MEMBER_INFO,
      ]);
    },
  });
}

// Performs the needed `select` for `useUserInfo`, but also inserts a call
// to analytics as a way to easily catch any changes to user info over time.
function mapUserDataAndHandleAnalytics(obj: RawUserRequest): User {
  const user = mapUserData(obj);
  // Downstream will handle figuring out group info (and if it's ready yet).
  analyticsSendUserInfo(user);
  return user;
}

export function useUserInfo(): UseQueryResult<User, unknown> {
  return useQuery([USE_USER_INFO], fetchUserInfo, {
    retry: false,
    // Analytics rides along here as a way to capture user info changes
    select: mapUserDataAndHandleAnalytics,
  });
}

/**
 * WARNING -- please AVOID using unless you have no choice but to use it.
 *
 * Gets the currently cached data for user info.
 * Generally, you **should** be using `useUserInfo` to get access to user info,
 * but that will only work within React components. If you find yourself in a
 * situation where you need access to user info, but you are outside of a React
 * component and there is no reasonable way to pass that info down to where
 * your code is happening, you can call this and it will return the currently
 * held info or `undefined` if user info not pulled yet or there was an error.
 *
 * Note that this implementation is also a bit brittle since we must manually
 * map the raw response data from the user info request into the JS object keys
 * we use in FE app. That's normally taken care of by `useUserInfo` because
 * of how it's set up, but we must manually call that func here.
 */
export const getCurrentUserInfo = (): User | undefined => {
  const rawUser = queryClient.getQueryData<RawUserRequest>([USE_USER_INFO]);
  return rawUser && mapUserData(rawUser);
};

/**
 * Moves users away from pages they should not see depending on user status.
 *
 * Primary purpose is to kick off redirects based on user status. If user is not
 * logged in, pushes them to the homepage. If user is logged in but has not
 * agreed to the Terms of Service yet, pushes them to ToS page so they must agree
 * before being able to use the app.
 *
 * Usage is simple: just call the function near the top of the component you want
 * to protect (according to above rules).
 * NOTE: The "protected" component will still render! This just puts in an async
 * call for userInfo data, and has a hook for redirecting based on that data. But
 * it will not prevent render, it just can then push the user away from that page.
 *
 * Returns: (obj) result of `useUserInfo` call
 *   [Could be refactored to have no return, but right now some components use that userInfo.
 *    Might be better to be more explicit though, have components directly call useUserInfo?]
 *
 * IMPORTANT NOTE:
 * This function does not provide "real" security. Think of it as a picket fence.
 * It's only intended to redirect users to where they should be. It does not prevent
 * protected routes/components from firing and would be easy for an attacker to circumvent.
 */
export function useProtectedRoute(): UseQueryResult<User, unknown> {
  const router = useRouter();
  const result = useUserInfo();
  const currentGroup = useSelector(selectCurrentGroup);

  const { isLoading, data: userInfo } = result;

  useEffect(() => {
    // Wait for the `useUserInfo` call to complete
    if (!isLoading) {
      const agreedToTOS = userInfo?.agreedToTos;
      if (!userInfo) {
        // Lack of user data implicitly means user is not logged in.
        router.push(ROUTES.HOMEPAGE);
      } else if (!agreedToTOS && router.asPath !== ROUTES.AGREE_TERMS) {
        router.push(ROUTES.AGREE_TERMS);
      } else if (!userInfo.groups.find((g) => g.id === currentGroup)) {
        // user is not authorized to view the group set in their cache. Set it to one they can see.
        setValidGroup();
      } // else case: User is logged in, in a valid group, and has agreed to ToS. Leave them be.
    }
  }, [isLoading, userInfo, router, currentGroup]);

  return result;
}
