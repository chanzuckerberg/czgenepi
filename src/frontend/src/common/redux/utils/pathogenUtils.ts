import {
  getLocalStorage,
  isWindowDefined,
} from "src/common/utils/localStorage";
import { store } from "..";
import { setPathogen } from "../actions";
import { selectCurrentPathogen } from "../selectors";
import { Pathogen, ReduxPersistenceTokens } from "../types";

export const isValidPathogen = (pathogen?: Pathogen): boolean =>
  Object.values(Pathogen).includes(pathogen);

export const ensureValidPathogen = async (): Promise<void> => {
  if (!isWindowDefined) return;

  const { dispatch, state } = store;

  // wait until app state initialized
  if (!state) return;

  // do nothing if valid pathogen already set
  const currentPathogen = selectCurrentPathogen(state);
  if (isValidPathogen(currentPathogen)) return;

  // TODO (mlila): in the future, if we ever put pathogens behind feature flags, we'll
  // TODO          want to check for that here.

  // otherwise, we only support COVID right now, so set pathogen to that
  dispatch(setPathogen(Pathogen.COVID));
};

export const getPathogenFromLocalStorage = (): Pathogen | undefined => {
  const storedPathogenStr = getLocalStorage(ReduxPersistenceTokens.PATHOGEN);
  const isValid = isValidPathogen(storedPathogenStr);

  return storedPathogenStr && isValid ? storedPathogenStr : undefined;
};
