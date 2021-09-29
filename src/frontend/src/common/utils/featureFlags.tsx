import { hasQueryParam } from ".";

interface FeatureFlag {
  isActive: boolean;
  param: string;
}

interface FlagsObj {
  [key: string]: FeatureFlag;
}

// we can add more keys to each flag as needed
export const FEATURE_FLAGS: FlagsObj = {
  mayasFlag: {
    isActive: true,
    param: "mayasFlag",
  },
};

export const usesFeatureFlag = (flag: FeatureFlag): boolean => {
  const { isActive, param } = flag;
  if (isActive && hasQueryParam(param)) return true;
  return false;
};
