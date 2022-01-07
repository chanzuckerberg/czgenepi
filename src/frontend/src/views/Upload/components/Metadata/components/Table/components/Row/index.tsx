import deepEqual from "deep-equal";
import { useFormik } from "formik";
import React, { useEffect } from "react";
import { noop } from "src/common/constants/empty";
import {
  DATE_ERROR_MESSAGE,
  DATE_REGEX,
} from "src/components/DateField/constants";
import { EMPTY_METADATA } from "src/views/Upload/components/common/constants";
import {
  Metadata,
  NamedGisaidLocation,
} from "src/views/Upload/components/common/types";
import * as yup from "yup";
import FreeTextField from "./components/FreeTextField";
import LocationField from "./components/LocationField";
import ToggleField from "./components/ToggleField";
import UploadDateField from "./components/UploadDateField";
import {
  Id,
  IsPrivateTableCell,
  StyledDiv,
  StyledTableCell,
  StyledTableRow,
} from "./style";

const validationSchema = yup.object({
  collectionDate: yup
    .string()
    .matches(DATE_REGEX, DATE_ERROR_MESSAGE)
    .min(10, DATE_ERROR_MESSAGE)
    .max(10, DATE_ERROR_MESSAGE)
    .required("Required"),
  collectionLocation: yup
    .object({
      id: yup.number().required(),
    })
    .required("Required"),
  publicId: yup.string().when("submittedToGisaid", {
    is: true,
    then: yup.string().required("Required"),
  }),
  sequencingDate: yup
    .string()
    .matches(DATE_REGEX, DATE_ERROR_MESSAGE)
    .min(10, DATE_ERROR_MESSAGE)
    .max(10, DATE_ERROR_MESSAGE),
  submittedToGisaid: yup.boolean(),
});

interface Props {
  id: string;
  metadata: Metadata;
  importedFileMetadata?: Metadata;
  handleMetadata: (id: string, sampleMetadata: Metadata) => void;
  applyToAllColumn: (fieldKey: keyof Metadata, value: unknown) => void;
  isFirstRow: boolean;
  handleRowValidation: (id: string, isValid: boolean) => void;
  warnings?: Set<keyof Metadata>;
  locations: NamedGisaidLocation[];
}

export default React.memo(function Row({
  id,
  metadata,
  importedFileMetadata,
  handleMetadata,
  applyToAllColumn,
  isFirstRow,
  handleRowValidation,
  warnings = new Set(),
  locations,
}: Props): JSX.Element {
  const formik = useFormik({
    enableReinitialize: true,
    // If new file import comes in, form resets and uses that as starting point
    initialValues: importedFileMetadata || EMPTY_METADATA,
    onSubmit: noop,
    validationSchema,
  });

  const { values, isValid, validateForm, setTouched } = formik;

  // If user has uploaded a file of metadata, consider all fields touched for
  // purposes of displaying validation warnings to them ("Required", etc)
  useEffect(() => {
    if (!importedFileMetadata) return;

    const touchedFields: Record<string, boolean> = {};
    Object.keys(values).forEach((fieldKey) => {
      touchedFields[fieldKey] = true;
    });
    setTouched(touchedFields, true);
  }, [importedFileMetadata, setTouched, values]);

  useEffect(() => {
    handleRowValidation(id, isValid);
  }, [isValid, handleRowValidation, id]);

  useEffect(() => {
    validateForm(values);

    if (!deepEqual(metadata, values)) {
      handleMetadata(id, values);
    }
  }, [values]);

  return (
    <StyledTableRow component="div">
      <StyledTableCell component="div">
        <Id>{id}</Id>
      </StyledTableCell>
      <StyledTableCell component="div">
        <StyledDiv>
          <UploadDateField
            isFirstRow={isFirstRow}
            applyToAllColumn={applyToAllColumn}
            formik={formik}
            fieldKey="collectionDate"
          />
        </StyledDiv>
      </StyledTableCell>
      <StyledTableCell component="div">
        <LocationField
          isFirstRow={isFirstRow}
          applyToAllColumn={applyToAllColumn}
          formik={formik}
          fieldKey="collectionLocation"
          locations={locations}
        />
      </StyledTableCell>
      <StyledTableCell component="div">
        <StyledDiv>
          <UploadDateField
            isFirstRow={isFirstRow}
            applyToAllColumn={applyToAllColumn}
            formik={formik}
            fieldKey="sequencingDate"
          />
        </StyledDiv>
      </StyledTableCell>
      <IsPrivateTableCell align="center" component="div">
        <ToggleField
          formik={formik}
          fieldKey="keepPrivate"
          isDisabled={Boolean(values.submittedToGisaid)}
          isAutocorrected={warnings.has("keepPrivate")}
        />
      </IsPrivateTableCell>
      <StyledTableCell align="center" component="div">
        <ToggleField
          formik={formik}
          fieldKey="submittedToGisaid"
          isDisabled={Boolean(values.keepPrivate)}
          isAutocorrected={warnings.has("submittedToGisaid")}
        />
      </StyledTableCell>
      <StyledTableCell component="div">
        <FreeTextField
          isShown={Boolean(values.submittedToGisaid)}
          formik={formik}
          fieldKey="publicId"
        />
      </StyledTableCell>
      <StyledTableCell component="div">
        <FreeTextField
          isShown={Boolean(values.submittedToGisaid)}
          formik={formik}
          fieldKey="islAccessionNumber"
        />
      </StyledTableCell>
    </StyledTableRow>
  );
});
