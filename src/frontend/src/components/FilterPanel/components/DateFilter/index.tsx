import React, { useState } from "react";
import { DateFilterMenu } from "src/components/DateFilterMenu";
import { DateChip } from "./components/DateChip";
import { StyledFilterWrapper, StyledInputDropdown } from "./style";

interface Props {
  fieldKeyEnd: string;
  fieldKeyStart: string;
  inputLabel: string;
  updateDateFilter: UpdateDateFilterType;
  menuOptions: DateMenuOption[];
}

const DateFilter = ({ inputLabel, ...props }: Props): JSX.Element => {
  // `startDate` and `endDate` represent the active filter dates. Update on filter change.
  const [startDate, setStartDate] = useState<FormattedDateType>();
  const [endDate, setEndDate] = useState<FormattedDateType>();
  const [dateLabel, setDateLabel] = useState<string | null>(null);
  const [anchorEl, setAnchorEl] = useState<HTMLElement | undefined>();
  const [shouldClearFilter, setShouldClearFilter] = useState<boolean>(false);

  const handleClick: React.MouseEventHandler<HTMLButtonElement> = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(undefined);
  };

  const deleteDateFilter = () => {
    setStartDate(undefined);
    setEndDate(undefined);
    setShouldClearFilter(true);
  };

  return (
    <StyledFilterWrapper>
      <StyledInputDropdown
        sdsStyle="minimal"
        sdsType="singleSelect"
        label={inputLabel}
        // @ts-expect-error remove line when inputdropdown types fixed in sds
        onClick={handleClick}
      />
      <DateFilterMenu
        {...props}
        anchorEl={anchorEl}
        onClose={handleClose}
        onStartDateChange={setStartDate}
        onEndDateChange={setEndDate}
        onDateLabelChange={setDateLabel}
        shouldClearFilter={shouldClearFilter}
        setShouldClearFilter={setShouldClearFilter}
      />
      <DateChip
        startDate={startDate}
        endDate={endDate}
        dateLabel={dateLabel}
        deleteDateFilterFunc={deleteDateFilter}
      />
    </StyledFilterWrapper>
  );
};

export { DateFilter };
