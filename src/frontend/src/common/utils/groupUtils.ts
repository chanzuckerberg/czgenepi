import { fetchUserInfo } from "../queries/auth";
import { store } from "../redux";
import { setGroup } from "../redux/actions";

export const setValidGroup = async (): Promise<void> => {
  if (typeof window === "undefined") {
    return;
  }
  const { dispatch } = store;
  const userInfo = await fetchUserInfo();
  const { groups } = userInfo;

  if (!groups) return;

  // sort groups by id to put the oldest one into the first position
  groups.sort((a, b) => (a.id > b.id ? 1 : -1));
  dispatch(setGroup(groups[0].id));
};
