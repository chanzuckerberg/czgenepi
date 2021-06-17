import { FormikContextType } from "formik";
import React from "react";
import { Metadata } from "src/views/Upload/components/common/types";
import { StyledTextField } from "./style";

interface Props {
  fieldKey: keyof Metadata;
  formik: FormikContextType<Metadata>;
  isShown: boolean;
}

export default function FreeTextField({
  fieldKey,
  formik,
  isShown,
}: Props): JSX.Element {
  const { handleChange, handleBlur, values, touched, errors } = formik;

  const errorMessage = touched[fieldKey] && errors[fieldKey];

  return (
    <StyledTextField
      isShown={isShown}
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
