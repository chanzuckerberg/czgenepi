import { FormikContextType } from "formik";
import React from "react";
import { Metadata } from "src/views/Upload/components/common/types";
import { StyledTextField } from "./style";

interface Props {
  fieldKey: keyof Metadata;
  formik: FormikContextType<Metadata>;
  isShown?: boolean;
}

export default function FreeTextField({
  fieldKey,
  formik,
  isShown = true,
}: Props): JSX.Element | null {
  const { handleChange, handleBlur, values, touched, errors } = formik;

  const errorMessage = touched[fieldKey] && errors[fieldKey];

  if (!isShown) return null;

  return (
    <StyledTextField
      name={fieldKey}
      margin="dense"
      variant="outlined"
      onChange={handleChange}
      onBlur={handleBlur}
      value={values[fieldKey] || ""}
      error={Boolean(errorMessage)}
      helperText={errorMessage}
    />
  );
}
