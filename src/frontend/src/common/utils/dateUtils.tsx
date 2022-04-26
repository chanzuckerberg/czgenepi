interface Args {
  currentLabel?: string;
  startDate?: DateType;
  endDate?: DateType;
}

export const getDateRangeLabel = ({
  currentLabel,
  startDate,
  endDate,
}: Args): string => {
  // If a date menu option was selected, just use its specific name instead
  if (currentLabel) return currentLabel;

  // DateChip should only display if we have at least one of startDate/endDate
  if (!startDate && !endDate) return "";

  // Get the date chip message. Structure varies if only one of the two dates.
  // Might be worth extracting date message to a common helper func elsewhere?
  return `${startDate || "Prior"} to ${endDate || "Today"}`;
};
