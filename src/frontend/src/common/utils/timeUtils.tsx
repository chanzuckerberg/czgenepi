import { NO_CONTENT_FALLBACK } from "src/components/Table/constants";

// Takes ISO8601 datetime with TZ and returns corresponding date
// (only) on user's machine.
// Eg, if user is in Pacific TZ
// datetimeWithTzToLocalDate("2021-12-02T01:07:48+00:00") => "2021-12-01"
export const datetimeWithTzToLocalDate = (d: string): string => {
  // We use this as a stand in for missing values in the tables
  if (!d || d.startsWith(NO_CONTENT_FALLBACK)) return d;

  const date = new Date(d);
  const offset = date.getTimezoneOffset();
  const offsetSeconds = offset * 60 * 1000;
  const utcDate = new Date(date.getTime() - offsetSeconds);
  return utcDate.toISOString().split("T")[0];
};
