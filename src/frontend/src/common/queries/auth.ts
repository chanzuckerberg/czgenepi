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
import {
  API,
  apiResponse,
  DEFAULT_HEADERS_MUTATION_OPTIONS,
  DEFAULT_PUT_OPTIONS,
} from "../api";
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

export const fetchUserInfo = (): Promise<UserResponse> =>
  apiResponse<UserResponse>(["group", "user"], [null, USER_MAP], API.USER_INFO);

const updateUserInfo = (user: Partial<User>): Promise<Response> => {
  return fetch(API_URL + API.USER_INFO, {
    ...DEFAULT_PUT_OPTIONS,
    ...DEFAULT_HEADERS_MUTATION_OPTIONS,
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

export function useProtectedRoute(): UseQueryResult<UserResponse, unknown> {
  const router = useRouter();
  const result = useUserInfo();

  const { isLoading, data } = result;
  const agreedToTOS = data?.user?.agreedToTos;

  useEffect(() => {
    if (!isLoading && !data) {
      router.push(ROUTES.HOMEPAGE);
    }
  }, [isLoading, data, router]);

  useEffect(() => {
    if (!isLoading && !agreedToTOS && router.asPath !== ROUTES.AGREE_TERMS) {
      router.push(ROUTES.AGREE_TERMS);
    }
  }, [isLoading, data, router, agreedToTOS]);

  return result;
}
