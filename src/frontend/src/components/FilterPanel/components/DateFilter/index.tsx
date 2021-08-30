import { Button, Menu, MenuItem } from "czifui";
import { useFormik } from "formik";
import { noop } from "lodash";
import React, { FC, useEffect, useState } from "react";
import DateField from "src/components/DateField";
import {
  DATE_ERROR_MESSAGE,
  DATE_REGEX,
} from "src/components/DateField/constants";
import * as yup from "yup";
import { StyledInputDropdown } from "../../style";
import { StyledDateRange, StyledText } from "./style";

export type FormattedDateType = string | undefined;
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
  updateDateFilter,
}) => {
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

  const { values, validateForm } = formik;

  useEffect(() => {
    validateForm(values);
  }, [validateForm, values]);

  const formatDate = (d: DateType) => {
    if (d === undefined) return d;
    if (typeof d === "string") return d;

    return d.toISOString().substring(0, 10);
  };

  const setDatesFromRange = (start: DateType, end: DateType) => {
    updateDateFilter(formatDate(start), formatDate(end));

    handleClose();
  };

  const setDatesFromOffset = (nDays: number) => {
    const start = new Date();
    start.setDate(start.getDate() - nDays);

    const end = new Date();

    setDatesFromRange(start, end);
  };

  //TODO use new sds component for single select on preset date ranges
  return (
    <div>
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
        <StyledDateRange>
          <DateField fieldKey={fieldKeyStart} formik={formik} />
          <StyledText>to</StyledText>
          <DateField fieldKey={fieldKeyEnd} formik={formik} />
          <Button
            onClick={() => {
              setDatesFromRange(values[fieldKeyStart], values[fieldKeyEnd]);
            }}
          >
            Apply
          </Button>
        </StyledDateRange>
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
    </div>
  );
};

export { DateFilter };
