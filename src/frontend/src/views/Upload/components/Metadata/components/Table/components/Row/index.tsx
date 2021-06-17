import deepEqual from "deep-equal";
import { useFormik } from "formik";
import React, { useEffect } from "react";
import { noop } from "src/common/constants/empty";
import { Metadata } from "src/views/Upload/components/common/types";
import * as yup from "yup";
import DateField from "./components/DateField";
import FreeTextField from "./components/FreeTextField";
import LocationField from "./components/LocationField";
import ToggleField from "./components/ToggleField";
import {
  Id,
  IsPrivateTableCell,
  StyledTableCell,
  StyledTableRow,
} from "./style";

const DATE_ERROR_MESSAGE = "Update format to YYYY-MM-DD";

const DATE_REGEX = /^\d{4}-(0[1-9]|1[012])-(0[1-9]|[12][0-9]|3[01])$/;

const validationSchema = yup.object({
  collectionDate: yup
    .string()
    .matches(DATE_REGEX, DATE_ERROR_MESSAGE)
    .min(10, DATE_ERROR_MESSAGE)
    .max(10, DATE_ERROR_MESSAGE)
    .required("Required"),
  collectionLocation: yup.string().required("Required"),
  publicId: yup.string().when("submittedToGisaid", {
    is: true,
    then: yup.string().required("Required"),
  }),
  sequencingDate: yup
    .string()
    .matches(DATE_REGEX, DATE_ERROR_MESSAGE)
    .min(10, DATE_ERROR_MESSAGE)
    .max(10, DATE_ERROR_MESSAGE),
  submittedToGisaid: yup.boolean(),
});

interface Props {
  id: string;
  metadata: Metadata;
  handleMetadata: (id: string, sampleMetadata: Metadata) => void;
  applyToAllColumn: (fieldKey: keyof Metadata, value: unknown) => void;
  isFirstRow: boolean;
  handleRowValidation: (id: string, isValid: boolean) => void;
  isTouched: boolean;
  isAutocorrected: boolean;
}

export default React.memo(function Row({
  id,
  metadata,
  handleMetadata,
  applyToAllColumn,
  isFirstRow,
  handleRowValidation,
  isTouched,
  isAutocorrected,
}: Props): JSX.Element {
  const formik = useFormik({
    enableReinitialize: true,
    initialValues: metadata,
    onSubmit: noop,
    validationSchema,
  });

  const { values, isValid, validateForm, setTouched } = formik;

  useEffect(() => {
    if (!isTouched) return;

    const newTouched: Record<string, boolean> = {};

    for (const fieldKey of Object.keys(values)) {
      newTouched[fieldKey] = true;
    }

    setTouched(newTouched, true);
  }, [isTouched, values]);

  useEffect(() => {
    handleRowValidation(id, isValid);
  }, [isValid]);

  useEffect(() => {
    validateForm(values);

    if (!deepEqual(metadata, values)) {
      handleMetadata(id, values);
    }
  }, [values]);

  return (
    <StyledTableRow component="div">
      <StyledTableCell component="div">
        <Id>{id}</Id>
      </StyledTableCell>
      <StyledTableCell component="div">
        <DateField
          isFirstRow={isFirstRow}
          applyToAllColumn={applyToAllColumn}
          formik={formik}
          fieldKey="collectionDate"
        />
      </StyledTableCell>
      <StyledTableCell component="div">
        <LocationField
          isFirstRow={isFirstRow}
          applyToAllColumn={applyToAllColumn}
          formik={formik}
          fieldKey="collectionLocation"
        />
      </StyledTableCell>
      <StyledTableCell component="div">
        <DateField
          isFirstRow={isFirstRow}
          applyToAllColumn={applyToAllColumn}
          formik={formik}
          fieldKey="sequencingDate"
        />
      </StyledTableCell>
      <IsPrivateTableCell align="center" component="div">
        <ToggleField
          formik={formik}
          fieldKey="keepPrivate"
          isDisabled={Boolean(values.submittedToGisaid)}
        />
      </IsPrivateTableCell>
      <StyledTableCell align="center" component="div">
        <ToggleField
          formik={formik}
          fieldKey="submittedToGisaid"
          isDisabled={Boolean(values.keepPrivate)}
          isAutocorrected={isAutocorrected}
        />
      </StyledTableCell>
      <StyledTableCell component="div">
        <FreeTextField
          isShown={Boolean(values.submittedToGisaid)}
          formik={formik}
          fieldKey="publicId"
        />
      </StyledTableCell>
      <StyledTableCell component="div">
        <FreeTextField
          isShown={Boolean(values.submittedToGisaid)}
          formik={formik}
          fieldKey="islAccessionNumber"
        />
      </StyledTableCell>
    </StyledTableRow>
  );
});
