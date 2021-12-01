export const formatTZDate = (d: string): string => {
  if (!d || d.startsWith("-")) return d;

  const date = new Date(d);
  const offset = date.getTimezoneOffset();
  const offsetSeconds = offset * 60 * 1000;
  const utcDate = new Date(date.getTime() - offsetSeconds);
  return utcDate.toISOString().split("T")[0];
};
