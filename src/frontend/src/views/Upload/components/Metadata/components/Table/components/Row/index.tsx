import deepEqual from "deep-equal";
import { useFormik } from "formik";
import React, { useEffect, useMemo } from "react";
import { noop } from "src/common/constants/empty";
import {
  DATE_ERROR_MESSAGE,
  DATE_REGEX,
} from "src/components/DateField/constants";
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
  /**
   * Below preps the metadata values form should initialize to.
   *
   * IMPORTANT NOTE: container-level `metadata` in parent somewhere above must
   * initialize each sample's metadata object to being a valid Metadata type.
   * (Currently done by initializing all to EMPTY_METADATA when samples change,
   * but the important part is we need to be able to trust incoming `metadata`
   * as starting off sane.)
   *
   * (Vince): I don't love this approach, but initialization currently must
   * serve three purposes: 1) non-file-upload use, start off as empty data user
   * can enter via web form; 2) if user leaves Metadata step then comes back,
   * the form should start off as whatever it last looked like; 3) when file
   * is uploaded, reset the form and use the values that were just uploaded.
   * If we only cared about (1) and (2), we could just turn off formik's
   * `enableReinitialize` so the initial values would be locked in once the
   * form is created: this would work both for handling the very first
   * interaction (because upstream inits metadata for us), and for re-visiting
   * (because `metadata` would be last seen). But because we need formik's
   * reinitialization so we can achieve (3), we need to keep the provided
   * `initialValues` stable and only change them when uploaded data changes.
   * So that's why it's memo-ized: prefer initializing on uploaded file data,
   * and if it's not available, use the starting metadata, but keep the
   * reference stable so we don't reinitalize out-of-turn. Then if any changes
   * come in for imported data, switch to those and kick off a reinitialize.
   *
   * FIXME (Vince): This could be made more robust (and clearer) if we changed
   * how metadata gets defaulted and also had a handler for emitting value
   * changes to formik when the `importedFileMetadata` changes. But I'm low
   * on time right now, and this change is fixing a bug we had where
   * the initialValues were only tied to upstream `metadata`, causing the
   * form to reset with every change, so "touched" couldn't be tracked.
   */
  const initialFormValues = useMemo(() => {
    return importedFileMetadata || { ...metadata };
  }, [importedFileMetadata]);

  const formik = useFormik({
    enableReinitialize: true,
    // If new file import comes in, form resets and uses that as starting point
    initialValues: initialFormValues,
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
