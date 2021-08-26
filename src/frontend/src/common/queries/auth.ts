import { useRouter } from "next/router";
import { useQuery, UseQueryResult } from "react-query";
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

export interface UserInfoResponse {
  email?: string;
  email_verified?: boolean;
  id?: string;
  is_authenticated?: boolean;
  name?: string;
}

interface UserResponse extends APIResponse {
  group: Group;
  user: User;
}

const USER_MAP = new Map<string, keyof User>([
  ["auth0_user_id", "auth0UserId"],
  ["group_admin", "groupAdmin"],
  ["system_admin", "systemAdmin"],
  ["group_id", "groupId"],
  ["agreed_to_tos", "agreedToTos"],
]);

export const fetchUserInfo = (): Promise<UserResponse> =>
  apiResponse<UserResponse>(["group", "user"], [null, USER_MAP], API.USER_INFO);

export const updateUserInfo = (user: Partial<User>): Promise<Response> => {
  return fetch(API_URL + API.USER_INFO, {
    ...DEFAULT_PUT_OPTIONS,
    ...DEFAULT_HEADERS_MUTATION_OPTIONS,
    body: JSON.stringify(user),
  });
};

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
  console.log("agreedToTOS: ", agreedToTOS);

  if (!isLoading && !data) {
    router.push(ROUTES.HOMEPAGE);
  }

  if (!isLoading && !agreedToTOS) {
    router.push(ROUTES.AGREE_TERMS);
  }

  return result;
}
