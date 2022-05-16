import { FormikContextType } from "formik";
import React, { ChangeEvent, useEffect, useState } from "react";
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
  onChange?: (d: ChangeEvent) => void;
  shouldShowEditedCellsAsMarked?: boolean;
}

export type valueType = string | boolean | NamedGisaidLocation | undefined;

export function checkIfCellShouldBeHighlighted(
  shouldShowEditedCellsAsMarked: boolean,
  initialValues: any,
  values: any,
  fieldKey: string,
) {
  const initialValue = initialValues[fieldKey];
  const changedValue = values[fieldKey];

  if (initialValue !== changedValue && shouldShowEditedCellsAsMarked) {
    return true;
  }
  return false;
}

export default function DateField({
  fieldKey,
  formik,
  helperText,
  onChange,
  shouldShowEditedCellsAsMarked,
}: Props): JSX.Element {
  const { handleChange, handleBlur, values, touched, errors, initialValues } =
    formik;

  const initialValue = initialValues && initialValues[fieldKey];
  const changedValue = values[fieldKey];
  // const [isBackgroundColorShown, setBackgroundColorShown] =
  //   useState<boolean>(false);
  // const [changedValue, setChangedValue] = useState<valueType>(undefined);
  // const [initialValue, setInitialValue] = useState<valueType>(undefined);

  // useEffect(() => {
  //   setChangedValue(values[fieldKey]);
  //   setInitialValue(initialValues[fieldKey]);
  // }, [fieldKey, initialValues, values]);

  // useEffect(() => {
  //   if (initialValue !== changedValue && shouldShowEditedCellsAsMarked) {
  //     setBackgroundColorShown(true);
  //   } else {
  //     setBackgroundColorShown(false);
  //   }
  // }, [initialValue, changedValue, shouldShowEditedCellsAsMarked]);
  const isBackgroundColorShown = checkIfCellShouldBeHighlighted(
    shouldShowEditedCellsAsMarked,
    initialValue,
    changedValue,
    fieldKey
  );

  const errorMessage = touched[fieldKey] && errors[fieldKey];

  const value = changedValue || "";

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
      isBackgroundColorShown={isBackgroundColorShown}
    />
  );
}
