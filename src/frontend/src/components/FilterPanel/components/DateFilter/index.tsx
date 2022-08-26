import { useState } from "react";
import { getDateRangeLabel } from "src/common/utils/dateUtils";
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

const DateFilter = ({
  inputLabel,
  updateDateFilter,
  ...props
}: Props): JSX.Element => {
  // `startDate` and `endDate` represent the active filter dates. Update on filter change.
  const [startDate, setStartDate] = useState<FormattedDateType>();
  const [endDate, setEndDate] = useState<FormattedDateType>();
  const [anchorEl, setAnchorEl] = useState<HTMLElement | undefined>();
  // What menu option is chosen. If none chosen, `null`.
  const [selectedDateMenuOption, setSelectedDateMenuOption] =
    useState<DateMenuOption | null>(null);

  const handleClick: React.MouseEventHandler<HTMLButtonElement> = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(undefined);
  };

  const deleteDateFilter = () => {
    setStartDate(undefined);
    setEndDate(undefined);
    setSelectedDateMenuOption(null);
    updateDateFilter(undefined, undefined);
  };

  const dateLabel = getDateRangeLabel({
    currentLabel: selectedDateMenuOption?.name,
    startDate,
    endDate,
  });

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
        anchorEl={anchorEl}
        onClose={handleClose}
        onStartDateChange={setStartDate}
        onEndDateChange={setEndDate}
        selectedDateMenuOption={selectedDateMenuOption}
        setSelectedDateMenuOption={setSelectedDateMenuOption}
        updateDateFilter={updateDateFilter}
        {...props}
      />
      <DateChip dateLabel={dateLabel} deleteDateFilterFunc={deleteDateFilter} />
    </StyledFilterWrapper>
  );
};

export { DateFilter };
