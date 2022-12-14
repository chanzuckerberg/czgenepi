const WORDS_TO_PLURALIZE: Record<string, string> = {
  has: "have",
  was: "were",
  is: "are",
  it: "they",
  does: "do",
};

export const pluralize = (str: string, count: number): string => {
  if (count === 1) return str;
  if (WORDS_TO_PLURALIZE[str]) return WORDS_TO_PLURALIZE[str];
  return `${str}s`;
};

export const pluralizeVerb = (str: string, count: number): string => {
  if (count === 1) return `${str}s`;
  if (WORDS_TO_PLURALIZE[str]) return WORDS_TO_PLURALIZE[str];
  return str;
};

type SortResponse = -1 | 0 | 1;
export const caseInsensitiveSort = (a: string, b: string): SortResponse => {
  return a.toLowerCase() > b.toLowerCase() ? 1 : -1;
};
