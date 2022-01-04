import {
  getLocalStorage,
  isWindowDefined,
  setLocalStorage,
} from "./localStorage";

const FEATURE_FLAG_PREFIX = "genepi-ff-";

interface FeatureFlag {
  isDisabled: boolean;
  key: string;
}

interface FlagsObj {
  [key: string]: FeatureFlag;
}

// we can add more keys to each flag as needed
export const FEATURE_FLAGS: FlagsObj = {
  mayasFlag: {
    isDisabled: true,
    key: "mayasFlag",
  },
};

const allowedKeys = Object.keys(FEATURE_FLAGS) as string[];

const isStrTrue = (str: string | null): boolean => {
  if (!str) return false;
  return str === "true";
};

export const usesFeatureFlag = (flag: FeatureFlag): boolean => {
  const { isDisabled, key } = flag;

  const storedValue = getLocalStorage(FEATURE_FLAG_PREFIX + key);
  const isBrowserUsingFlag = isStrTrue(storedValue ?? "");

  if (!isDisabled && isBrowserUsingFlag) return true;
  return false;
};

// Every time you refresh the app or load it from scratch, the feature
// flags are set again. Flags are not cleared between page loads.
export const setFeatureFlagsFromQueryParams = (): void => {
  if (!isWindowDefined()) return;

  const search = window.location.search;
  if (!search) return;

  const params = new URLSearchParams(search);

  params.forEach((value, key) => {
    if (!allowedKeys.includes(key)) return;

    setFeatureFlag(key, value);
  });
};

const setFeatureFlag = (key: string, value: string) => {
  setLocalStorage(FEATURE_FLAG_PREFIX + key, value);
};
