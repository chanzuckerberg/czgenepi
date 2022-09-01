import { RootStateType } from "../index";
import { Pathogen } from "../types";

export const selectCurrentGroup = (state: RootStateType): number =>
  state.current.group;

export const selectCurrentPathogen = (state: RootStateType): Pathogen =>
  state.current.pathogen;
