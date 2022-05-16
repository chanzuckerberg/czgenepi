import { FormikContextType } from "formik";
import React, { useEffect, useState } from "react";
import { Metadata } from "src/components/WebformTable/common/types";
import { StyledTextField } from "./style";

interface Props {
  fieldKey: keyof Metadata;
  formik: FormikContextType<Metadata>;
  isShown?: boolean;
  shouldShowEditedCellsAsMarked?: boolean; // used to mark edited cells as purple for crud
}

type valueType = string | boolean | NamedGisaidLocation | undefined;

export default function FreeTextField({
  fieldKey,
  formik,
  isShown = true,
  shouldShowEditedCellsAsMarked = false,
}: Props): JSX.Element | null {
  const [isBackgroundColorShown, setBackgroundColorShown] =
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
    if (initialValue !== changedValue && shouldShowEditedCellsAsMarked) {
      setBackgroundColorShown(true);
    } else {
      setBackgroundColorShown(false);
    }
  }, [initialValue, changedValue, shouldShowEditedCellsAsMarked]);

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
