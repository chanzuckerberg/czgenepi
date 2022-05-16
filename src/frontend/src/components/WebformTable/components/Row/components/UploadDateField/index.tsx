import { FormikContextType } from "formik";
import React from "react";
import DateField from "src/components/DateField";
import { SampleUploadTsvMetadata } from "src/components/DownloadMetadataTemplate/common/types";
import ApplyToAllColumn from "../common/ApplyToAllColumn";

interface Props {
  fieldKey: keyof SampleUploadTsvMetadata;
  formik: FormikContextType<SampleUploadTsvMetadata>;
  applyToAllColumn: (
    fieldKey: keyof SampleUploadTsvMetadata,
    value: unknown
  ) => void;
  isFirstRow: boolean;
  shouldShowEditedCellsAsMarked?: boolean; // used to mark edited cells as purple for crud
}

export default function UploadDateField({
  fieldKey,
  formik,
  applyToAllColumn,
  isFirstRow,
  shouldShowEditedCellsAsMarked = false,
}: Props): JSX.Element {
  const { values, touched, errors } = formik;

  const errorMessage = touched[fieldKey] && errors[fieldKey];

  const value = values[fieldKey] || "";

  return (
    <DateField
      fieldKey={fieldKey}
      formik={formik}
      shouldShowEditedCellsAsMarked={shouldShowEditedCellsAsMarked}
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
