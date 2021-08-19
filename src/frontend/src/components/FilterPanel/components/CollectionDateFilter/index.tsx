import { Button, Menu, MenuItem } from "czifui";
import { useFormik } from "formik";
import { noop } from "lodash";
import React, { FC, useEffect, useState } from "react";
//TODO: move this to a more central location
import DateField from "src/views/Upload/components/Metadata/components/Table/components/Row/components/DateField";
import * as yup from "yup";
import { StyledDateRange, StyledText } from "./style";

//TODO: move these to a constants file and DRY
const DATE_ERROR_MESSAGE = "Update format to YYYY-MM-DD";

const DATE_REGEX = /^\d{4}-(0[1-9]|1[012])-(0[1-9]|[12][0-9]|3[01])$/;

//TODO: can this also be a constant? not sure.
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

//TODO add type interface
const CollectionDateFilter: FC = ({ updateCollectionDateFilter }) => {
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

  const formatDate = (d) => {
    if (typeof d === "string") return d;

    return d.toISOString().substring(0, 10);
  };

  const setCollectionDatesFromRange = (start, end) => {
    updateCollectionDateFilter(formatDate(start), formatDate(end));

    handleClose();
  };

  const setCollectionDatesFromOffset = (nDays) => {
    const start = new Date();
    start.setDate(start.getDate() - nDays);

    const end = new Date();

    setCollectionDatesFromRange(start, end);
  };

  //TODO use new sds component for single select on preset date ranges
  return (
    <>
      <Button onClick={handleClick}>Click me!</Button>
      <Menu
        anchorEl={anchorEl}
        keepMounted
        open={Boolean(anchorEl)}
        onClose={handleClose}
        getContentAnchorEl={null}
      >
        <StyledDateRange>
          {/* TODO: possibly abstract out the unneeded props here */}
          <DateField
            fieldKey="collectionDateStart"
            formik={formik}
            applyToAllColumn={noop}
            isFirstRow={false}
          />
          <StyledText>to</StyledText>
          <DateField
            fieldKey="collectionDateEnd"
            formik={formik}
            applyToAllColumn={noop}
            isFirstRow={false}
          />
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
