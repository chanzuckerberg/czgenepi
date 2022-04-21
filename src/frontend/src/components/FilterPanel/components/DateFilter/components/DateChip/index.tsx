import React from "react";
import { StyledChip } from "../../../../style";

interface DateChipProps {
  startDate?: DateType;
  endDate?: DateType;
  dateLabel: string | null;
  deleteDateFilterFunc: () => void;
}

const DateChip = ({
  startDate,
  endDate,
  dateLabel,
  deleteDateFilterFunc,
}: DateChipProps): JSX.Element | null => {
  // DateChip should only display if we have at least one of startDate/endDate
  if (!startDate && !endDate) return null;

  // Get the date chip message. Structure varies if only one of the two dates.
  // Might be worth extracting date message to a common helper func elsewhere?
  let dateIntervalLabel = `${startDate || "Prior"} to ${endDate || "Today"}`;
  // If a date menu option was selected, just use its specific name instead
  if (dateLabel) {
    dateIntervalLabel = dateLabel;
  }
  return (
    <StyledChip
      size="medium"
      label={dateIntervalLabel}
      onDelete={deleteDateFilterFunc}
    />
  );
};

export { DateChip };
