import { find } from "lodash";
import { store } from "../redux";
import { selectCurrentGroup } from "../redux/selectors";

/**
 * Takes the stored id for the current group and returns the available details about that group
 * from /me response
 */
export const getCurrentGroupFromUserInfo = (
  userInfo?: User
): UserGroup | undefined => {
  const state = store.getState();
  const currentGroupId = selectCurrentGroup(state);
  return find(userInfo?.groups, (g) => g.id === currentGroupId);
};

export const getIsGroupAdminFromUserInfo = (userInfo?: User): boolean => {
  const currentGroup = getCurrentGroupFromUserInfo(userInfo);
  const roles: GroupRole[] = currentGroup?.roles ?? [];
  return roles.includes("admin");
};
