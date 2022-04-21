import React, { useState } from "react";
import { getDateRangeLabel } from "src/common/utils/dateUtils";
import { MENU_OPTION_ALL_TIME } from "src/components/DateFilterMenu/constants";
import { StyledDateFilterMenu, StyledInputDropdown } from "./style";

interface Props {
  fieldKeyEnd: string;
  fieldKeyStart: string;
  menuOptions: DateMenuOption[];
  updateDateFilter: UpdateDateFilterType;
}

const CollectionDateFilter = ({
  updateDateFilter,
  ...props
}: Props): JSX.Element => {
  // `startDate` and `endDate` represent the active filter dates. Update on filter change.
  const [startDate, setStartDate] = useState<FormattedDateType>();
  const [endDate, setEndDate] = useState<FormattedDateType>();
  const [anchorEl, setAnchorEl] = useState<HTMLElement | undefined>();
  // What menu option is chosen. If none chosen, `null`.
  const [selectedDateMenuOption, setSelectedDateMenuOption] =
    useState<DateMenuOption | null>(MENU_OPTION_ALL_TIME);

  const handleClick: React.MouseEventHandler<HTMLButtonElement> = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(undefined);
  };

  const dateLabel = getDateRangeLabel({
    currentLabel: selectedDateMenuOption?.name,
    startDate,
    endDate,
  });

  return (
    <>
      <StyledInputDropdown
        sdsStyle="square"
        sdsType="singleSelect"
        label={dateLabel}
        // @ts-expect-error remove line when inputdropdown types fixed in sds
        onClick={handleClick}
      />
      <StyledDateFilterMenu
        {...props}
        anchorEl={anchorEl}
        onClose={handleClose}
        onStartDateChange={setStartDate}
        onEndDateChange={setEndDate}
        selectedDateMenuOption={selectedDateMenuOption}
        setSelectedDateMenuOption={setSelectedDateMenuOption}
        updateDateFilter={updateDateFilter}
      />
    </>
  );
};

export { CollectionDateFilter };
