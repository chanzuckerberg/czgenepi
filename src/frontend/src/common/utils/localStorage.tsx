export const isWindowDefined = (): boolean => {
  return typeof window !== "undefined";
};

export const getLocalStorage = (key: string): string => {
  if (!isWindowDefined()) return "";
  return window?.localStorage?.getItem(key) ?? "";
};

export const setLocalStorage = (key: string, value: string): void => {
  if (!isWindowDefined()) return;
  window?.localStorage?.setItem(key, value);
};
