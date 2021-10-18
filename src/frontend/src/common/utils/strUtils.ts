export const pluralize = (str: string, count: number): string => {
  return count === 1 ? str : `${str}s`;
};
