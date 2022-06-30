// export action type for use in reducers and middleware
export const groupPersistedName = "currentGroup";
export const setGroupActionType = "group/setGroup";
export const setGroup = (groupId: number): Action => ({
  type: setGroupActionType,
  payload: groupId,
});

export const pathogenPersistedName = "currentPathogen";
export const setPathogenActionType = "pathogen/setPathogen";
export const setPathogen = (pathogen: Pathogen): Action => ({
  type: setPathogenActionType,
  payload: pathogen,
});
