import { find } from "lodash";
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
 * Determines whether or not a user has permission to view the given group
 */
export const canUserViewGroup = (
  userInfo: User | undefined,
  groupId: number
): boolean => {
  return getUserGroupInfoByGroupId(userInfo, groupId) ? true : false;
};
