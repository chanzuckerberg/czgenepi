import { FormikContextType } from "formik";
import React, { useEffect, useState } from "react";
import { valueType } from "src/components/DateField";
import { Metadata } from "src/components/WebformTable/common/types";
import { StyledTextField } from "./style";

interface Props {
  fieldKey: keyof Metadata;
  formik: FormikContextType<Metadata>;
  isShown?: boolean;
  shouldShowEditedInputAsMarked?: boolean; // used to mark edited cells as purple for crud
}

export default function FreeTextField({
  fieldKey,
  formik,
  isShown = true,
  shouldShowEditedInputAsMarked = false,
}: Props): JSX.Element | null {
  const [isBackgroundColorShown, setIsBackgroundColorShown] =
    useState<boolean>(false);
  const [changedValue, setChangedValue] = useState<valueType>(undefined);
  const [initialValue, setInitialValue] = useState<valueType>(undefined);

  const { handleChange, handleBlur, values, touched, errors, initialValues } =
    formik;
  useEffect(() => {
    setChangedValue(values[fieldKey]);
    setInitialValue(initialValues[fieldKey]);
  }, [fieldKey, initialValues, values]);

  useEffect(() => {
    if (initialValue !== changedValue && shouldShowEditedInputAsMarked) {
      setIsBackgroundColorShown(true);
    } else {
      setIsBackgroundColorShown(false);
    }
  }, [initialValue, changedValue, shouldShowEditedInputAsMarked]);

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
      isBackgroundColorShown={isBackgroundColorShown}
    />
  );
}
