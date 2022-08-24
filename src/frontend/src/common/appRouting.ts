import { useRouter } from "next/router";
import { store } from "./redux";
import { setPathogen } from "./redux/actions";
import { selectCurrentGroup, selectCurrentPathogen } from "./redux/selectors";
import { Pathogen } from "./redux/types";
import { ensureValidGroup } from "./redux/utils/groupUtils";
import { ensureValidPathogen } from "./redux/utils/pathogenUtils";
import { publicPaths } from "./routes";

export const useAppRouting = (): void => {
  const router = useRouter();
  const path = router.basePath;

  if (path in publicPaths) {
    setPublicPagePath(router);
  } else {
    setCurrentWorkspace(router);
  }
};

const setCurrentWorkspace = (router) => {
  const { params } = router.query;

  const potentialUrlPathogen = params?.pop();
  const potentialUrlGroupId = params?.pop();

  const urlGroupId = getWorkspaceGroupId(potentialUrlGroupId);
  const urlPathogen = getWorkspacePathogen(potentialUrlPathogen);

  generateAppPagePath(router, params, urlGroupId, urlPathogen);
};

const getWorkspaceGroupId = (potentialUrlGroupId) => {
  // if it's not a number, it's not a groupId
  if (isNaN(parseInt(potentialUrlGroupId))) ensureValidGroup();

  // ensure that the group can be viewed by user, and change
  // to another group if not
  await ensureValidGroup();

  // now that we know the groupId is valid, return it
  return selectCurrentGroup(state);
};

const getWorkspacePathogen = async (potentialUrlPathogen) => {
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

const generateAppPagePath = (router, params, urlGroupId, urlPathogen) => {
  console.log(router);
};

const setPublicPagePath = (router) => {
  const path = router.path;
  console.log(path);
};
