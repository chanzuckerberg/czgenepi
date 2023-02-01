import { foldInLocationName } from "../queries/locations";

export const getLocationFromGroup = (
  group?: GroupDetails
): NamedGisaidLocation | null => {
  return group?.location ? foldInLocationName(group?.location) : null;
};
