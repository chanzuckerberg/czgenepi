import { useRouter } from "next/router";
import { store } from "./redux";
import { setGroup, setPathogen } from "./redux/actions";
import { selectCurrentGroup, selectCurrentPathogen } from "./redux/selectors";
import { Pathogen } from "./redux/types";
import { ensureValidGroup } from "./redux/utils/groupUtils";
import { ensureValidPathogen } from "./redux/utils/pathogenUtils";
import { publicPaths } from "./routes";
import { canUserViewGroup } from "./utils/userInfo";

export const useAppRouting = (): void => {
  const router = useRouter();
  const path = router.basePath;

  if (path in publicPaths) {
    setPublicPagePath(router);
  } else {
    setCurrentWorkspace(router);
  }
};

// TODO (mlila): do i need to rename all the pages files to be ...params? not sure how
// TODO          trailing params will affect fetching
const setCurrentWorkspace = async (router) => {
  const { params } = router.query;

  // TODO (mlila): this is a fragile assumption about url params.
  const potentialUrlPathogen = params?.pop();
  const potentialUrlGroupId = params?.pop();

  const urlGroupId = await setWorkspaceGroupId(potentialUrlGroupId);
  const urlPathogen = await setWorkspacePathogen(potentialUrlPathogen);

  const path = generateAppPagePath(router, params, urlGroupId, urlPathogen);
  router.push(path);
};

const setWorkspaceGroupId = async (potentialUrlGroupId: string): number => {
  const userInfo = await fetchUserInfo();
  const { dispatch, getState } = store;
  const state = getState();

  // ensure that the group passed via url can be viewed by user
  // if so, that's the group they will be looking at now
  const canUserView = await canUserViewGroup(userInfo, potentialUrlGroupId);
  if (canUserView) {
    dispatch(setGroup(potentialUrlGroupId));
    return potentialUrlGroupId;
  }

  // if not, show the last group they viewed, if possible.
  // and, finally, change to another group they _can_ view as last resort.
  await ensureValidGroup();

  // now that we know the groupId is valid, return it
  return selectCurrentGroup(state);
};

const setWorkspacePathogen = async (potentialUrlPathogen: string): Pathogen => {
  const { dispatch, getState } = store;
  const state = getState();

  // if they are requesting a pathogen our app supports, we're good to go
  if (potentialUrlPathogen in Pathogen) {
    dispatch(setPathogen(potentialUrlPathogen));
    return potentialUrlPathogen;
  }

  // TODO (mlila): in the future, if we add pathogens behind feature flags
  // TODO:         add those checks here

  // otherwise, set a valid pathogen before continuing
  await ensureValidPathogen();

  // now that we know the pathogen is valid, return it
  return selectCurrentPathogen(state);
};

const generateAppPagePath = (router, params, urlGroupId, urlPathogen): string => {
  console.log(router);
};

const setPublicPagePath = (router): string => {
  const path = router.path;
  console.log(path);
};
