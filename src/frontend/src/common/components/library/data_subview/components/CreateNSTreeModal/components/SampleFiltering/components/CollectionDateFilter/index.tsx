import { useState } from "react";
import { noop } from "src/common/constants/empty";
import { getDateRangeLabel } from "src/common/utils/dateUtils";
import {
  MENU_OPTIONS_COLLECTION_DATE,
  MENU_OPTION_ALL_TIME,
} from "src/components/DateFilterMenu/constants";
import { StyledFilterGroup, StyledFilterGroupName } from "../../style";
import { StyledDateFilterMenu, StyledInputDropdown } from "./style";

export type StartDateFilterType = {
  startDate: FormattedDateType;
  setStartDate: (d: FormattedDateType) => void;
};

export type EndDateFilterType = {
  endDate: FormattedDateType;
  setEndDate: (d: FormattedDateType) => void;
};

interface Props extends StartDateFilterType, EndDateFilterType {}

const CollectionDateFilter = ({
  startDate,
  endDate,
  setStartDate,
  setEndDate,
}: Props): JSX.Element => {
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
    <StyledFilterGroup>
      <StyledFilterGroupName>Collection Date</StyledFilterGroupName>
      <StyledInputDropdown
        sdsStyle="square"
        sdsType="singleSelect"
        label={dateLabel}
        // @ts-expect-error remove line when inputdropdown types fixed in sds
        onClick={handleClick}
      />
      <StyledDateFilterMenu
        anchorEl={anchorEl}
        data-test-id="collection-date"
        fieldKeyEnd="collectionDateEnd"
        fieldKeyStart="collectionDateStart"
        menuOptions={[...MENU_OPTIONS_COLLECTION_DATE, MENU_OPTION_ALL_TIME]}
        onClose={handleClose}
        onStartDateChange={setStartDate}
        onEndDateChange={setEndDate}
        selectedDateMenuOption={selectedDateMenuOption}
        setSelectedDateMenuOption={setSelectedDateMenuOption}
        updateDateFilter={noop}
      />
    </StyledFilterGroup>
  );
};

export { CollectionDateFilter };
