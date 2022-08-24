import { isWindowDefined } from "src/common/utils/localStorage";
import { store } from "..";
import { fetchUserInfo } from "../../queries/auth";
import { setGroup } from "../actions";
import { selectCurrentGroup } from "../selectors";

export const ensureValidGroup = async (): Promise<void> => {
  if (!isWindowDefined) return;

  const { dispatch, state } = store;
  const userInfo = await fetchUserInfo();
  const { groups } = userInfo;

  // wait until app initialized & user info loaded
  if (!state || !groups) return;

  // do nothing if valid group already set
  const currentGroup = selectCurrentGroup(state);
  if (groups.find((g) => g.id === currentGroup)) return;

  // otherwise, sort groups by id to put the oldest one into the first position
  groups.sort((a, b) => (a.id > b.id ? 1 : -1));
  dispatch(setGroup(groups[0].id));
};
