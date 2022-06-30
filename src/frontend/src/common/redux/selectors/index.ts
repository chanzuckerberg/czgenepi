import { RootStateType } from "..";
import { Pathogen } from "../redux";

export const selectCurrentGroup = (state: RootStateType): number =>
  state.current.group;

export const selectCurrentPathogen = (state: RootStateType): Pathogen =>
  state.current.pathogen;
