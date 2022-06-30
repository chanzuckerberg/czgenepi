export const setGroup = (groupId: number): Action => ({
  type: "group/setGroup",
  payload: groupId,
});

export const setPathogen = (pathogen: Pathogen): Action => ({
  type: "pathogen/setPathogen",
  payload: pathogen,
});
