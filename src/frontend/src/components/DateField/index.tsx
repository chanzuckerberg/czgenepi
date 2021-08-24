import { FormikContextType } from "formik";
import React from "react";
import { StyledTextField } from "./style";

const DATE_LENGTH = 10;

const INPUT_PROPS = {
  maxLength: DATE_LENGTH,
  minLength: DATE_LENGTH,
};

interface Props {
  fieldKey: string;
  formik: FormikContextType<any>;
  helperText?: any;
}

export default function DateField({
  fieldKey,
  formik,
  helperText,
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
      helperText={helperText || errorMessage}
    />
  );
}
