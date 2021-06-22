import { FormikContextType } from "formik";
import React from "react";
import { Metadata } from "src/views/Upload/components/common/types";
import ApplyToAllColumn from "../common/ApplyToAllColumn";
import { StyledTextField } from "./style";

// "YYYY-MM-DD".length
const DATE_LENGTH = 10;

const INPUT_PROPS = {
  maxLength: DATE_LENGTH,
  minLength: DATE_LENGTH,
};

interface Props {
  fieldKey: keyof Metadata;
  formik: FormikContextType<Metadata>;
  applyToAllColumn: (fieldKey: keyof Metadata, value: unknown) => void;
  isFirstRow: boolean;
}

export default function DateField({
  fieldKey,
  formik,
  applyToAllColumn,
  isFirstRow,
}: Props): JSX.Element {
  const { handleChange, handleBlur, values, touched, errors } = formik;

  const errorMessage = touched[fieldKey] && errors[fieldKey];

  const value = values[fieldKey] || "";

  return (
    <StyledTextField
      name={fieldKey}
      inputProps={INPUT_PROPS}
      placeholder="YYYY-MM-DD"
      margin="dense"
      variant="outlined"
      onChange={handleChange}
      onBlur={handleBlur}
      value={value}
      error={Boolean(errorMessage)}
      helperText={
        errorMessage ||
        (isFirstRow && value && (
          <ApplyToAllColumn
            fieldKey={fieldKey}
            value={value}
            handleClick={applyToAllColumn}
          />
        ))
      }
    />
  );
}
