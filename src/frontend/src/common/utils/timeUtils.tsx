export const formatTZDate = (d: Date): string => {
  if (!d || d === "-") return d;

  const date = new Date(d);
  const offset = date.getTimezoneOffset();
  const offsetSeconds = offset * 60 * 1000;
  const utcDate = new Date(date.getTime() - offsetSeconds);
  return utcDate.toISOString().split("T")[0];
};
