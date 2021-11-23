import { escapeRegExp } from "lodash/fp";
import deepEqual from "deep-equal";
import { useFormik } from "formik";
import React, { useEffect, useState, useReducer } from "react";
import { noop } from "src/common/constants/empty";
import {
  DATE_ERROR_MESSAGE,
  DATE_REGEX,
} from "src/components/DateField/constants";
import { Metadata } from "src/views/Upload/components/common/types";
import * as yup from "yup";
import FreeTextField from "./components/FreeTextField";
import ToggleField from "./components/ToggleField";
import UploadDateField from "./components/UploadDateField";
import LocationField from "./components/LocationField";
import {
  Id,
  IsPrivateTableCell,
  StyledDiv,
  StyledTableCell,
  StyledTableRow,
} from "./style";
import { Dropdown } from "czifui";

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
  warnings?: Set<keyof Metadata>;
  locationOptions: GisaidLocationOption[];
}

export default React.memo(function Row({
  id,
  metadata,
  handleMetadata,
  applyToAllColumn,
  isFirstRow,
  handleRowValidation,
  isTouched,
  warnings = new Set(),
  locationOptions,
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
  }, [isTouched, setTouched, values]);

  useEffect(() => {
    handleRowValidation(id, isValid);
  }, [isValid, handleRowValidation, id]);

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
        <StyledDiv>
          <UploadDateField
            isFirstRow={isFirstRow}
            applyToAllColumn={applyToAllColumn}
            formik={formik}
            fieldKey="collectionDate"
          />
        </StyledDiv>
      </StyledTableCell>
      <StyledTableCell component="div">
        <LocationField
          isFirstRow={isFirstRow}
          applyToAllColumn={applyToAllColumn}
          formik={formik}
          fieldKey="collectionLocationID"
          locationOptions={locationOptions}
        />
      </StyledTableCell>
      <StyledTableCell component="div">
        <StyledDiv>
          <UploadDateField
            isFirstRow={isFirstRow}
            applyToAllColumn={applyToAllColumn}
            formik={formik}
            fieldKey="sequencingDate"
          />
        </StyledDiv>
      </StyledTableCell>
      <IsPrivateTableCell align="center" component="div">
        <ToggleField
          formik={formik}
          fieldKey="keepPrivate"
          isDisabled={Boolean(values.submittedToGisaid)}
          isAutocorrected={warnings.has("keepPrivate")}
        />
      </IsPrivateTableCell>
      <StyledTableCell align="center" component="div">
        <ToggleField
          formik={formik}
          fieldKey="submittedToGisaid"
          isDisabled={Boolean(values.keepPrivate)}
          isAutocorrected={warnings.has("submittedToGisaid")}
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
