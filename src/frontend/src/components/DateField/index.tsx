import { FormikContextType } from "formik";
import React, { ChangeEvent } from "react";
import { StyledTextField } from "./style";

const DATE_LENGTH = 10;

const INPUT_PROPS = {
  maxLength: DATE_LENGTH,
  minLength: DATE_LENGTH,
};

export type FormattedDateType = string | undefined;

interface Props {
  fieldKey: string;
  formik: FormikContextType<any>;
  helperText?: any;
  onChange?: (d: ChangeEvent) => void;
}

export default function DateField({
  fieldKey,
  formik,
  helperText,
  onChange,
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
      onChange={(e) => {
        onChange && onChange(e);
        handleChange(e);
      }}
      onBlur={handleBlur}
      value={value}
      error={Boolean(errorMessage)}
      helperText={helperText}
    />
  );
}
