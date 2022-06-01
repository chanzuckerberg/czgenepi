export const getGroupIdFromUser = (user?: User): number | undefined => {
  if (!user) return;

  const { group } = user;
  if (!group) return;

  const { id } = group;
  return id;
};
