import { RootStateType } from "../index";

export const selectCurrentGroup = (state: RootStateType): number | null =>
  state.current.group;

export const selectCurrentPathogen = (state: RootStateType): Pathogen | null =>
  state.current.pathogen;
