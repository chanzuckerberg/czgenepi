import { Menu, MenuItem } from "czifui";
import { useFormik } from "formik";
import { noop } from "lodash";
import React, { FC, useEffect, useState } from "react";
import DateField, { FormattedDateType } from "src/components/DateField";
import {
  DATE_ERROR_MESSAGE,
  DATE_REGEX,
} from "src/components/DateField/constants";
import * as yup from "yup";
import {
  StyledChip,
  StyledFilterWrapper,
  StyledInputDropdown,
} from "../../style";
import {
  StyledButton,
  StyledDateRange,
  StyledManualDate,
  StyledText,
} from "./style";

export type DateType = FormattedDateType | Date;

export interface DateMenuOption {
  name: string; // Must be UNIQUE because we assume can be used as key/id
  // For both `numDays...` it's relative to now() when option is chosen.
  // Assume start is guaranteed, but end cap is not.
  numDaysEndOffset?: number;  // How far back end of date interval is
  numDaysStartOffset: number; // How far back start of date interval is
}

interface Props {
  fieldKeyEnd: string;
  fieldKeyStart: string;
  inputLabel: string;
  updateDateFilter: (start: FormattedDateType, end: FormattedDateType) => void;
  menuOptions: DateMenuOption[];
}

const DateFilter: FC<Props> = ({
  fieldKeyEnd,
  fieldKeyStart,
  inputLabel,
  updateDateFilter, // Don't directly call, use below `setDatesFromRange` instead
  menuOptions,
}) => {
  // `startDate` and `endDate` represent the active filter dates. Update on filter change.
  const [startDate, setStartDate] = useState<FormattedDateType>();
  const [endDate, setEndDate] = useState<FormattedDateType>();
  // What menu option is chosen. If none chosen, `null`.
  const [selectedDateMenuOption, setSelectedDateMenuOption] = useState<DateMenuOption | null>(null);
  const [anchorEl, setAnchorEl] = useState<HTMLElement>();

  const validationSchema = yup.object({
    [fieldKeyEnd]: yup
      .string()
      .matches(DATE_REGEX, DATE_ERROR_MESSAGE)
      .min(10, DATE_ERROR_MESSAGE)
      .max(10, DATE_ERROR_MESSAGE),
    [fieldKeyStart]: yup
      .string()
      .matches(DATE_REGEX, DATE_ERROR_MESSAGE)
      .min(10, DATE_ERROR_MESSAGE)
      .max(10, DATE_ERROR_MESSAGE),
  });

  const handleClick: React.MouseEventHandler<HTMLButtonElement> = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(undefined);
  };

  const formik = useFormik({
    initialValues: {
      [fieldKeyEnd]: undefined,
      [fieldKeyStart]: undefined,
    },
    onSubmit: noop,
    validationSchema,
  });

  const { values, validateForm, isValid, setFieldValue } = formik;
  useEffect(() => {
    validateForm(values).then(() => console.log('YOOOLO'));
    console.log(validateForm(values));
    console.log("isValid", isValid); // REMOVE
  }, [validateForm, values]);
  // HACK (vince): Because `isValid` runs async, but starting empty fields of undefined
  // is considered valid
  // AGGGHHH SLOW ASYNC
  let areFieldsValid = false;
  if ((values[fieldKeyStart] || values[fieldKeyEnd]) && isValid) {
    areFieldsValid = true;
  }

  const formatDate = (d: DateType) => {
    if (d === undefined) return d;
    if (typeof d === "string") return d;

    return d.toISOString().substring(0, 10);
  };

  // Use this over directly using `updateDateFilter` prop so we track filter changes.
  const setDatesFromRange = (start: DateType, end: DateType) => {
    console.log("areFieldsValid", areFieldsValid); // REMOVE
    const newStartDate = formatDate(start);
    const newEndDate = formatDate(end);
    setStartDate(newStartDate);
    setEndDate(newEndDate);

    updateDateFilter(newStartDate, newEndDate);
    handleClose();
  };

  const setDatesFromMenuOption = (dateOption: DateMenuOption) => {
    setSelectedDateMenuOption(dateOption);
    // Selecting a menu option clears out anything entered in the fields.
    setFieldValue(fieldKeyStart, undefined);
    setFieldValue(fieldKeyEnd, undefined);

    // We assume start of interval is always guaranteed, but not necessarily end
    const start = new Date();
    start.setDate(start.getDate() - dateOption.numDaysStartOffset);
    let end = undefined;
    if (dateOption.numDaysEndOffset) {
      end = new Date();
      end.setDate(end.getDate() - dateOption.numDaysEndOffset);
    }
    setDatesFromRange(start, end);
  };

  const setDatesFromFields = (start: DateType, end: DateType) => {
    // Since using fields instead, clear out selected menu option
    setSelectedDateMenuOption(null);
    setDatesFromRange(start, end);
  };

  const deleteDateFilter = () => {
    setSelectedDateMenuOption(null);
    setDatesFromRange(undefined, undefined);
  };

  //TODO when it's available, use sds component for single select on preset date ranges
  return (
    <StyledFilterWrapper>
      <StyledInputDropdown
        sdsStyle="minimal"
        label={inputLabel}
        // @ts-expect-error remove line when inputdropdown types fixed in sds
        onClick={handleClick}
      />
      <Menu
        anchorEl={anchorEl}
        keepMounted
        open={Boolean(anchorEl)}
        onClose={handleClose}
        getContentAnchorEl={null}
      >
        <StyledManualDate>
          <StyledDateRange>
            <DateField
              fieldKey={fieldKeyStart}
              formik={formik}
            />
            <StyledText>to</StyledText>
            <DateField
              fieldKey={fieldKeyEnd}
              formik={formik}
            />
          </StyledDateRange>
          {(values[fieldKeyStart] || values[fieldKeyEnd]) && (
            <StyledButton
              color="primary"
              variant="contained"
              onClick={() => {
                setDatesFromFields(values[fieldKeyStart], values[fieldKeyEnd]);
              }}
              disabled={!areFieldsValid}
            >
              Apply
            </StyledButton>
          )}
        </StyledManualDate>
        {/* TODO (mlila): use a single select here instead */}
        {menuOptions.map((dateOption) => (
          <MenuItem
            key={dateOption.name}
            onClick={() => setDatesFromMenuOption(dateOption)}
            selected={Boolean(selectedDateMenuOption && selectedDateMenuOption.name === dateOption.name)}
          >
            {dateOption.name}
          </MenuItem>
        ))}
      </Menu>
      <DateChip
        startDate={startDate}
        endDate={endDate}
        selectedDateMenuOption={selectedDateMenuOption}
        deleteDateFilter={deleteDateFilter}
      />
    </StyledFilterWrapper>
  );
};

interface DateChipProps {
  startDate?: DateType;
  endDate?: DateType;
  selectedDateMenuOption: DateMenuOption | null;
  deleteDateFilter: () => void;
}

function DateChip({
  startDate,
  endDate,
  selectedDateMenuOption,
  deleteDateFilter,
}: DateChipProps): JSX.Element | null {
  // DateChip should only display if we have at least one of startDate/endDate
  if (!startDate && !endDate) return null;

  // Get the date chip message. Structure varies if only one of the two dates.
  // Might be worth extracting date message to a common helper func elsewhere?
  let dateIntervalLabel = `${startDate || "Prior"} to ${endDate || "Today"}`;
  // If a date menu option was selected, just use its specific name instead
  if (selectedDateMenuOption) { dateIntervalLabel = selectedDateMenuOption.name; }
  return (
    <StyledChip
      size="medium"
      label={dateIntervalLabel}
      onDelete={deleteDateFilter}
    />
  );
}

export { DateFilter };
