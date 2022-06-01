import { useRouter } from "next/router";
import { useEffect } from "react";
import {
  useMutation,
  UseMutationResult,
  useQuery,
  useQueryClient,
  UseQueryResult,
} from "react-query";
import ENV from "src/common/constants/ENV";
import { API, DEFAULT_PUT_OPTIONS, getBackendApiJson } from "../api";
import { ROUTES } from "../routes";
import { ENTITIES } from "./entities";
import { mapGroupData, RawGroupRequest } from "./groups";

const { API_URL } = ENV;

export const USE_USER_INFO = {
  entities: [ENTITIES.USER_INFO],
  id: "userInfo",
};

export interface RawUserRequest {
  id: number;
  name: string;
  group: RawGroupRequest;
  agreed_to_tos: boolean;
  acknowledged_policy_version: string | null; // Date or null in DB. ISO 8601: "YYYY-MM-DD"
  split_id: string;
  group_admin: boolean;
}

export const mapUserData = (obj: RawUserRequest): User => {
  const mappedUserData: User = {
    acknowledgedPolicyVersion: obj.acknowledged_policy_version,
    agreedToTos: obj.agreed_to_tos,
    id: obj.id,
    isGroupAdmin: obj.group_admin,
    name: obj.name,
    splitId: obj.split_id,
  };

  if (obj.group) mappedUserData.group = mapGroupData(obj.group);

  return mappedUserData;
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
      await queryClient.invalidateQueries([USE_USER_INFO]);
    },
  });
}

export function useUserInfo(): UseQueryResult<User, unknown> {
  return useQuery([USE_USER_INFO], fetchUserInfo, {
    retry: false,
    select: mapUserData,
  });
}

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
      } // else case: User is logged in and has agreed to ToS. Leave them be.
    }
  }, [isLoading, userInfo, router]);

  return result;
}
