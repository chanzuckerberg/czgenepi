// (mlila): get the group id off a user. If one is not available, return an invalid number.
// This is a hack to enable multiple hooks to be used in components.
// For example, if we run /me and the request has not returned yet, no user info is
// available to get a group id. However, since data hooks (api calls) cannot be run conditionally,
// we cannot return null from the component at the point where we know there is no user
// data available.

// In the future, we may want to consider changing api calls from hooks (function whose names begin
// with `use`, to regular functions to facilitate this kind of request stacking)
export const getGroupIdFromUser = (user?: User): number => {
  if (!user) return -1;

  const { group } = user;
  if (!group) return -1;

  const { id } = group;
  return id;
};
