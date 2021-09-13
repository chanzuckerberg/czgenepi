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
  StyledFilterWrapper,
  StyledInputDropdown,
  StyledChip,
} from "../../style";
import {
  StyledButton,
  StyledDateRange,
  StyledManualDate,
  StyledText,
} from "./style";

export type DateType = FormattedDateType | Date;

interface Props {
  fieldKeyEnd: string;
  fieldKeyStart: string;
  inputLabel: string;
  updateDateFilter: (start: FormattedDateType, end: FormattedDateType) => void;
}

const DateFilter: FC<Props> = ({
  fieldKeyEnd,
  fieldKeyStart,
  inputLabel,
  updateDateFilter, // Don't directly call, use below `setDatesFromRange` instead
}) => {
  // `startDate` and `endDate` represent the active filter dates. Update on filter change.
  const [startDate, setStartDate] = useState<FormattedDateType>();
  const [endDate, setEndDate] = useState<FormattedDateType>();
  // `working...` versions are internal display while user enters date string.
  const [workingStartDate, setWorkingStartDate] = useState<FormattedDateType>();
  const [workingEndDate, setWorkingEndDate] = useState<FormattedDateType>();
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

  const {
    values,
    validateForm,
    setFieldValue,
  } = formik;

  useEffect(() => {
    validateForm(values);
  }, [validateForm, values]);

  const formatDate = (d: DateType) => {
    if (d === undefined) return d;
    if (typeof d === "string") return d;

    return d.toISOString().substring(0, 10);
  };


  // Use this over directly using `updateDateFilter` prop so we track filter changes.
  // In addition to setting upstream filter, also sets internal date states.
  const setDatesFromRange = (start: DateType, end: DateType) => {
    const newStartDate = formatDate(start);
    const newEndDate = formatDate(end);
    setStartDate(newStartDate);
    setEndDate(newEndDate);
    // Also set `working...` versions and formik so visibile next time user opens dropdown
    setWorkingStartDate(newStartDate);
    setFieldValue(fieldKeyStart, newStartDate);
    setWorkingEndDate(newEndDate);
    setFieldValue(fieldKeyEnd, newEndDate);

    updateDateFilter(newStartDate, newEndDate);
    handleClose();
  };

  const setDatesFromOffset = (nDays: number) => {
    const start = new Date();
    start.setDate(start.getDate() - nDays);

    setDatesFromRange(start, undefined);
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
              onChange={(e) => {
                const target = e.target as HTMLTextAreaElement;
                setWorkingStartDate(target?.value);
              }}
            />
            <StyledText>to</StyledText>
            <DateField
              fieldKey={fieldKeyEnd}
              formik={formik}
              onChange={(e) => {
                const target = e.target as HTMLTextAreaElement;
                setWorkingEndDate(target?.value);
              }}
            />
          </StyledDateRange>
          {(workingStartDate || workingEndDate) && (
            <StyledButton
              color="primary"
              variant="contained"
              onClick={() => {
                setDatesFromRange(values[fieldKeyStart], values[fieldKeyEnd]);
              }}
            >
              Apply
            </StyledButton>
          )}
        </StyledManualDate>
        {/* TODO (mlila): use a single select here instead */}
        <MenuItem onClick={() => setDatesFromOffset(7)}>Last 7 Days</MenuItem>
        <MenuItem onClick={() => setDatesFromOffset(30)}>Last 30 Days</MenuItem>
        <MenuItem onClick={() => setDatesFromOffset(90)}>
          Last 3 Months
        </MenuItem>
        <MenuItem onClick={() => setDatesFromOffset(180)}>
          Last 6 Months
        </MenuItem>
        <MenuItem onClick={() => setDatesFromOffset(365)}>Last Year</MenuItem>
      </Menu>
      <DateChip
        startDate={startDate}
        endDate={endDate}
        deleteDateFilter={() => setDatesFromRange(undefined, undefined)}
      />
    </StyledFilterWrapper>
  );
};


interface DateChipProps {
  startDate?: DateType;
  endDate?: DateType;
  deleteDateFilter: () => void;
}

function DateChip ({
  startDate,
  endDate,
  deleteDateFilter,
}: DateChipProps): JSX.Element | null {
  // DateChip should only display if we have at least one of startDate/endDate
  if (!startDate && !endDate) return null;

  // Get the date chip message. Structure varies if only one of the two dates.
  // Might be worth extracting date message to a common helper func elsewhere?
  const dateIntervalLabel = `${startDate || 'Prior'} to ${endDate || 'today'}`;
  return (
    <StyledChip
      size="medium"
      label={dateIntervalLabel}
      onDelete={deleteDateFilter}
    />
  );
}

export { DateFilter };
