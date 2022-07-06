import { ActionType, CZGEReduxActions, Pathogen } from "../types";

export const setGroup: ActionType<number> = (groupId) => ({
  type: CZGEReduxActions.SET_GROUP_ACTION_TYPE,
  payload: groupId,
});

export const setPathogen: ActionType<Pathogen> = (pathogen) => ({
  type: CZGEReduxActions.SET_PATHOGEN_ACTION_TYPE,
  payload: pathogen,
});
