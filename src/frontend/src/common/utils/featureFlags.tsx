import { hasQueryParam } from ".";

// we can add more keys to each flag as needed
export const FEATURE_FLAGS = {
  mayasFlag: {
    isActive: true,
    param: "mayasFlag",
  },
};

export const usesFeatureFlag = (flag: string): boolean => {
  const { isActive, param } = flag;
  if (isActive && hasQueryParam(param)) return true;
  return false;
};
