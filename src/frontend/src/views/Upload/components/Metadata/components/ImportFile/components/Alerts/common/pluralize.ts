const WORDS_TO_PLURALIZE: Record<string, string> = {
  Sample: "Samples",
  sample: "samples",
  was: "were",
};

export function maybePluralize(word: string, count: number): string {
  return count > 1 ? WORDS_TO_PLURALIZE[word] : word;
}
