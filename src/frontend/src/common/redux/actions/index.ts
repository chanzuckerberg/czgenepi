// export action type for use in middleware
export const setGroupActionType = "group/setGroup";
export const setGroup = (groupId: number): Action => ({
  type: setGroupActionType,
  payload: groupId,
});

// you can inline an action type if you aren't using it anywhere else
export const setPathogen = (pathogen: Pathogen): Action => ({
  type: "pathogen/setPathogen",
  payload: pathogen,
});
