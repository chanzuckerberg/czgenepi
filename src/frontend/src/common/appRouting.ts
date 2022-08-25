import { useRouter } from "next/router";
import { fetchUserInfo } from "./queries/auth";
import { store } from "./redux";
import { setGroup, setPathogen } from "./redux/actions";
import { selectCurrentGroup, selectCurrentPathogen } from "./redux/selectors";
import { Pathogen } from "./redux/types";
import { ensureValidGroup } from "./redux/utils/groupUtils";
import { ensureValidPathogen } from "./redux/utils/pathogenUtils";
import { publicPaths } from "./routes";
import { canUserViewGroup } from "./utils/userInfo";

const GROUP_URL_INDICATOR = "group";
const PATHOGEN_URL_INDICATOR = "pathogen";

export const useAppRouting = (): void => {
  const router = useRouter();
  const path = router.basePath;

  // public page paths shouldn't ever occur with the extra params
  // so if a user navigates to a public page, just do nothing --
  // they're already in the right place
  if (!(path in publicPaths)) {
    setCurrentWorkspacePath(router);
  }
};

/**
 * Ensures the groupId and pathogen in the url are valid and the user can
 * access them. If not, redirects the user to a group/pathogen they _can_ access.
 */
const setCurrentWorkspacePath = async (router) => {
  const { params } = router.query;

  // nothing to parse here
  if (!params) return;

  let potentialUrlPathogen;
  let potentialUrlGroupId;

  for (let i = 0; i < params.length - 1; i++) {
    if (params[i] === GROUP_URL_INDICATOR) {
      potentialUrlGroupId = params[i + 1];
    }

    if (params[i] === PATHOGEN_URL_INDICATOR) {
      potentialUrlPathogen = params[i + 1];
    }
  }

  const urlGroupId = await setWorkspaceGroupId(potentialUrlGroupId);
  const urlPathogen = await setWorkspacePathogen(potentialUrlPathogen);

  const path = generateAppPagePath(router, params, urlGroupId, urlPathogen);
  // router.push(path);
};

/**
 * Ensures the groupId in the url are valid and the user can
 * access it. If not, returns a group the user can access.
 */
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

/**
 * Ensures the pathogen in the url are valid and the user can
 * access it. If not, returns a pathogen the user can access.
 */
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
