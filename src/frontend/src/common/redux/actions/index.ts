// export action type for use in reducers and middleware
// persisted names are for use in localstorage
export const groupPersistedName = "currentGroup";
export const setGroupActionType = "group/setGroup";
export const setGroup: ActionType<number> = (groupId) => ({
  type: setGroupActionType,
  payload: groupId,
});

export const pathogenPersistedName = "currentPathogen";
export const setPathogenActionType = "pathogen/setPathogen";
export const setPathogen: ActionType<Pathogen> = (pathogen) => ({
  type: setPathogenActionType,
  payload: pathogen,
});
