type FormattedDateType = string | undefined;
type DateType = FormattedDateType | Date;

type UpdateDateFilterType = (
  start: Date | undefined,
  end: Date | undefined
) => void;

type DateMenuOption = {
  name: string; // Must be UNIQUE because we assume can be used as key/id
  // For both `numDays...` it's relative to now() when option is chosen.
  // Assume start is guaranteed, but end cap is not.
  numDaysEndOffset?: number; // How far back end of date interval is
  numDaysStartOffset?: number; // How far back start of date interval is
};
