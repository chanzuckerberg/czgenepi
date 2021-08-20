import { FormikContextType } from "formik";
import React from "react";
import DateField from "src/components/DateField";
import { Metadata } from "src/views/Upload/components/common/types";
import ApplyToAllColumn from "../common/ApplyToAllColumn";

interface Props {
  fieldKey: keyof Metadata;
  formik: FormikContextType<Metadata>;
  applyToAllColumn: (fieldKey: keyof Metadata, value: unknown) => void;
  isFirstRow: boolean;
}

export default function UploadDateField({
  fieldKey,
  formik,
  applyToAllColumn,
  isFirstRow,
}: Props): JSX.Element {
  const { values, touched, errors } = formik;

  const errorMessage = touched[fieldKey] && errors[fieldKey];

  const value = values[fieldKey] || "";

  return (
    <DateField
      fieldKey={fieldKey}
      formik={formik}
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
