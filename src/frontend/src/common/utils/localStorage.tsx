export const isWindowDefined = (): boolean => {
  return typeof window !== "undefined";
};

export const getLocalStorage = (key: string): string | null => {
  if (!isWindowDefined()) return null;
  return window?.localStorage?.getItem(key);
};

export const setLocalStorage = (key: string, value: string): void => {
  if (!isWindowDefined()) return;
  window?.localStorage?.setItem(key, value);
};
