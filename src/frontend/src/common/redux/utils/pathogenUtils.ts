import { isWindowDefined } from "src/common/utils/localStorage";
import { store } from "..";
import { setPathogen } from "../actions";
import { selectCurrentPathogen } from "../selectors";
import { Pathogen } from "../types";

export const ensureValidPathogen = async (): Promise<void> => {
  if (!isWindowDefined) return;

  const { dispatch, state } = store;

  // wait until app state initialized
  if (!state) return;

  // do nothing if valid pathogen already set
  const currentPathogen = selectCurrentPathogen(state);
  if (currentPathogen in Pathogen) return;

  // otherwise, we only support COVID right now, so set pathogen to that
  dispatch(setPathogen(Pathogen.COVID));
};
