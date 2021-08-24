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
import { StyledDateRange, StyledText } from "./style";

type FormattedDateType = string | undefined;
type DateType = FormattedDateType | Date;

interface Props {
  updateCollectionDateFilter: (
    start: FormattedDateType,
    end: FormattedDateType
  ) => void;
}

const validationSchema = yup.object({
  collectionDateEnd: yup
    .string()
    .matches(DATE_REGEX, DATE_ERROR_MESSAGE)
    .min(10, DATE_ERROR_MESSAGE)
    .max(10, DATE_ERROR_MESSAGE),
  collectionDateStart: yup
    .string()
    .matches(DATE_REGEX, DATE_ERROR_MESSAGE)
    .min(10, DATE_ERROR_MESSAGE)
    .max(10, DATE_ERROR_MESSAGE),
});

const CollectionDateFilter: FC<Props> = ({ updateCollectionDateFilter }) => {
  const [anchorEl, setAnchorEl] = useState<HTMLElement>();

  const handleClick: React.MouseEventHandler<HTMLButtonElement> = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(undefined);
  };

  const formik = useFormik({
    initialValues: {
      collectionDateEnd: undefined,
      collectionDateStart: undefined,
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

  const setCollectionDatesFromRange = (start: DateType, end: DateType) => {
    updateCollectionDateFilter(formatDate(start), formatDate(end));

    handleClose();
  };

  const setCollectionDatesFromOffset = (nDays: number) => {
    const start = new Date();
    start.setDate(start.getDate() - nDays);

    const end = new Date();

    setCollectionDatesFromRange(start, end);
  };

  //TODO use new sds component for single select on preset date ranges
  return (
    <>
      <Button onClick={handleClick}>Collection Date</Button>
      <Menu
        anchorEl={anchorEl}
        keepMounted
        open={Boolean(anchorEl)}
        onClose={handleClose}
        getContentAnchorEl={null}
      >
        <StyledDateRange>
          <DateField fieldKey="collectionDateStart" formik={formik} />
          <StyledText>to</StyledText>
          <DateField fieldKey="collectionDateEnd" formik={formik} />
          <Button
            onClick={() => {
              setCollectionDatesFromRange(
                values.collectionDateStart,
                values.collectionDateEnd
              );
            }}
          >
            Apply
          </Button>
        </StyledDateRange>
        <MenuItem onClick={() => setCollectionDatesFromOffset(7)}>
          Last 7 Days
        </MenuItem>
        <MenuItem onClick={() => setCollectionDatesFromOffset(30)}>
          Last 30 Days
        </MenuItem>
        <MenuItem onClick={() => setCollectionDatesFromOffset(90)}>
          Last 3 Months
        </MenuItem>
        <MenuItem onClick={() => setCollectionDatesFromOffset(180)}>
          Last 6 Months
        </MenuItem>
        <MenuItem onClick={() => setCollectionDatesFromOffset(365)}>
          Last Year
        </MenuItem>
      </Menu>
    </>
  );
};

export { CollectionDateFilter };
