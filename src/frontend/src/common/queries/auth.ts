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
import { API, apiResponse, DEFAULT_PUT_OPTIONS } from "../api";
import { ROUTES } from "../routes";
import { ENTITIES } from "./entities";

const { API_URL } = ENV;

export const USE_USER_INFO = {
  entities: [ENTITIES.USER_INFO],
  id: "userInfo",
};

export interface UserResponse extends APIResponse {
  group: Group;
  user: User;
}

const USER_MAP = new Map<string, keyof User>([
  ["auth0_user_id", "auth0UserId"],
  ["group_admin", "groupAdmin"],
  ["system_admin", "systemAdmin"],
  ["group_id", "groupId"],
  ["agreed_to_tos", "agreedToTos"],
  ["acknowledged_policy_version", "acknowledgedPolicyVersion"],
]);

export const fetchUserInfo = (): Promise<UserResponse> => {
  return apiResponse<UserResponse>(
    ["group", "user"],
    [null, USER_MAP],
    API.USER_INFO
  );
};

const updateUserInfo = (user: Partial<User>): Promise<Response> => {
  return fetch(API_URL + API.USER_INFO, {
    ...DEFAULT_PUT_OPTIONS,
    body: JSON.stringify(user),
  });
};

export function useUpdateUserInfo(): UseMutationResult<
  Response,
  unknown,
  Partial<User>,
  unknown
> {
  const queryClient = useQueryClient();

  return useMutation(updateUserInfo, {
    onSuccess: async () => {
      await queryClient.invalidateQueries([USE_USER_INFO]);
    },
  });
}

export function useUserInfo(): UseQueryResult<UserResponse, unknown> {
  return useQuery([USE_USER_INFO], fetchUserInfo, {
    retry: false,
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
export function useProtectedRoute(): UseQueryResult<UserResponse, unknown> {
  const router = useRouter();
  const result = useUserInfo();

  const { isLoading, data } = result;

  useEffect(() => {
    // Wait for the `useUserInfo` call to complete
    if (!isLoading) {
      const agreedToTOS = data?.user?.agreedToTos;
      if (!data) {
        // Lack of user data implicitly means user is not logged in.
        router.push(ROUTES.HOMEPAGE);
      } else if (!agreedToTOS && router.asPath !== ROUTES.AGREE_TERMS) {
        router.push(ROUTES.AGREE_TERMS);
      } // else case: User is logged in and has agreed to ToS. Leave them be.
    }
  }, [isLoading, data, router]);

  return result;
}
