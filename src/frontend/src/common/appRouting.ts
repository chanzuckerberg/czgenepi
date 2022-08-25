import { NextRouter, useRouter } from "next/router";
import { fetchUserInfo, mapUserData } from "./queries/auth";
import { store } from "./redux";
import { setGroup, setPathogen } from "./redux/actions";
import { selectCurrentGroup, selectCurrentPathogen } from "./redux/selectors";
import { Pathogen } from "./redux/types";
import { ensureValidGroup } from "./redux/utils/groupUtils";
import {
  ensureValidPathogen,
  isValidPathogen,
} from "./redux/utils/pathogenUtils";
import { publicPaths } from "./routes";
import { canUserViewGroup } from "./utils/userInfo";

// TODO (mlila): if we end up with more than two workspace values (groupId, pathogen)
// TODO          consider creating a map with these indicators. This would allow us
// TODO          to construct the url more programmatically. For example, we would not have
// TODO          to enumerate conditional statements in setCurrentWorkspacePath and
// TODO          replacePathParams. Doing so with only 2 variables feels a little heavy
// TODO          handed at the moment, though.
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
const setCurrentWorkspacePath = async (router: NextRouter) => {
  const { params } = router.query;

  // nothing to parse here
  if (!params) return;

  let groupTokenIndex;
  let pathogenTokenIndex;
  let potentialUrlPathogen;
  let potentialUrlGroupId;

  for (let i = 0; i < params.length - 1; i++) {
    const nextIndex = i + 1;

    if (params[i] === GROUP_URL_INDICATOR) {
      groupTokenIndex = nextIndex;
      potentialUrlGroupId = params[nextIndex];
    }

    if (params[i] === PATHOGEN_URL_INDICATOR) {
      pathogenTokenIndex = nextIndex;
      potentialUrlPathogen = params[nextIndex];
    }
  }

  const urlGroupId = await setWorkspaceGroupId(potentialUrlGroupId);
  const urlPathogen = await setWorkspacePathogen(potentialUrlPathogen);

  const newPath = replacePathParams({
    groupTokenIndex,
    pathogenTokenIndex,
    router,
    urlGroupId,
    urlPathogen,
  });

  // don't redirect if user already viewing correct workspace
  if (router.asPath !== newPath) {
    router.push(newPath);
  }
};

/**
 * Ensures the groupId in the url are valid and the user can
 * access it. If not, returns a group the user can access.
 */
const setWorkspaceGroupId = async (
  potentialUrlGroupId = ""
): Promise<string> => {
  const rawUserInfo = await fetchUserInfo();
  const userInfo = mapUserData(rawUserInfo);
  const { dispatch, getState } = store;
  const state = getState();

  // ensure that the group passed via url can be viewed by user
  // if so, that's the group they will be looking at now
  const potentialUrlGroupInt = parseInt(potentialUrlGroupId);
  const canUserView = await canUserViewGroup(userInfo, potentialUrlGroupInt);
  if (canUserView) {
    dispatch(setGroup(potentialUrlGroupInt));
    return potentialUrlGroupId;
  }

  // if not, show the last group they viewed, if possible.
  // and, finally, change to another group they _can_ view as last resort.
  await ensureValidGroup();

  // now that we know the groupId is valid, return it
  return selectCurrentGroup(state).toString();
};

/**
 * Ensures the pathogen in the url are valid and the user can
 * access it. If not, returns a pathogen the user can access.
 */
const setWorkspacePathogen = async (
  potentialUrlPathogen = ""
): Promise<Pathogen> => {
  const { dispatch, getState } = store;
  const state = getState();

  // if they are requesting a pathogen our app supports, we're good to go
  if (isValidPathogen(potentialUrlPathogen)) {
    const verifiedPathogen = potentialUrlPathogen as Pathogen;
    dispatch(setPathogen(verifiedPathogen));
    return verifiedPathogen;
  }

  // TODO (mlila): in the future, if we add pathogens behind feature flags
  // TODO:         add those checks here

  // otherwise, set a valid pathogen before continuing
  await ensureValidPathogen();

  // now that we know the pathogen is valid, return it
  return selectCurrentPathogen(state);
};

/**
 * Takes an old url and some new params, then constructs a new url based on
 * the page viewed and new workspace values (groupId, pathogen, etc)
 */
interface Props {
  router: NextRouter;
  groupTokenIndex?: number;
  pathogenTokenIndex?: number;
  urlGroupId: string;
  urlPathogen: string;
}

const replacePathParams = ({
  router,
  groupTokenIndex,
  pathogenTokenIndex,
  urlGroupId,
  urlPathogen,
}: Props): string => {
  const { pathname, query } = router;
  // this removes the `[[...params]]` that next.js appends to page paths which accept
  // parameters. Unfortunately, there doesn't seem to be a way to get the base path
  // without this piece from the router.
  const oldPathTokens: string[] = pathname?.split("/") ?? [];
  oldPathTokens.pop();

  // make a copy of params to keep anything else that was in the path before
  const newPathParams = [...query.params];

  // groupTokenIndex may be undefined if the user simply navigates to, eg, /data/samples
  // without providing a group id in the url. May happen from existing bookmarks or
  // muscle memory for users who typed in url before we had param handling
  if (!groupTokenIndex) {
    newPathParams.push(GROUP_URL_INDICATOR);
    newPathParams.push(urlGroupId);
  } else {
    newPathParams[groupTokenIndex] = urlGroupId;
  }

  if (!pathogenTokenIndex) {
    newPathParams.push(PATHOGEN_URL_INDICATOR);
    newPathParams.push(urlPathogen);
  } else {
    newPathParams[pathogenTokenIndex] = urlPathogen;
  }

  const newTokens = oldPathTokens.concat(newPathParams);
  return newTokens.join("/");
};
