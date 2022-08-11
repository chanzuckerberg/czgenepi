import { find } from "lodash";
import { queryClient } from "pages/_app";
import {
  mapUserData,
  RawUserRequest,
  USE_USER_INFO,
} from "src/common/queries/auth";
import { store } from "../redux";
import { selectCurrentGroup } from "../redux/selectors";

// Pulls UserGroup info for the specified groupId. If userInfo `undefined` or
// group missing from the user's available groups, returns `undefined`.
export const getUserGroupInfoByGroupId = (
  userInfo: User | undefined,
  groupId: number
): UserGroup | undefined => {
  return find(userInfo?.groups, (g) => g.id === groupId);
};

/**
 * Takes the stored id for the current group and returns the available details about that group
 * from /me response
 *
 * If no group has been loaded for user yet (i.e., still on FALLBACK_GROUP_ID),
 * or if the group is missing for some reason, returns `undefined`.
 */
export const getCurrentGroupFromUserInfo = (
  userInfo?: User
): UserGroup | undefined => {
  const state = store.getState();
  const currentGroupId = selectCurrentGroup(state);
  return getUserGroupInfoByGroupId(userInfo, currentGroupId);
};

export const getIsGroupAdminFromUserInfo = (userInfo?: User): boolean => {
  const currentGroup = getCurrentGroupFromUserInfo(userInfo);
  const roles: GroupRole[] = currentGroup?.roles ?? [];
  return roles.includes("admin");
};

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
