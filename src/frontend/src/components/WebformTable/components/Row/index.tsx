import deepEqual from "deep-equal";
import { useFormik } from "formik";
import React, { useEffect, useMemo } from "react";
import { noop } from "src/common/constants/empty";
import {
  DATE_ERROR_MESSAGE,
  DATE_REGEX,
} from "src/components/DateField/constants";
import { Metadata } from "src/components/WebformTable/common/types";
import {
  MAX_NAME_LENGTH,
  VALID_NAME_REGEX,
} from "src/views/Upload/components/common/constants";
import { NamedGisaidLocation } from "src/views/Upload/components/common/types";
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
  sequencingDate: yup
    .string()
    .matches(DATE_REGEX, DATE_ERROR_MESSAGE)
    .min(10, DATE_ERROR_MESSAGE)
    .max(10, DATE_ERROR_MESSAGE)
    .nullable(),
  privateId: yup
    .string()
    .required("Required")
    .matches(VALID_NAME_REGEX, "Invalid character(s)")
    .max(MAX_NAME_LENGTH, "Too long"),
});

interface Props {
  id: string;
  metadata: Metadata;
  // TODO (phoenix): once sample edit has import option remove this as optional
  hasImportedMetadataFile: boolean;
  handleMetadata: (id: string, sampleMetadata: Metadata) => void;
  applyToAllColumn: (fieldKey: keyof Metadata, value: unknown) => void;
  isFirstRow: boolean;
  handleRowValidation: (id: string, isValid: boolean) => void;
  warnings: Set<keyof Metadata>;
  locations: NamedGisaidLocation[];
  shouldSkipIdColumn?: boolean;
  shouldShowEditedCellsAsMarked?: boolean;
}

export default React.memo(function Row({
  id,
  metadata,
  hasImportedMetadataFile,
  handleMetadata,
  applyToAllColumn,
  isFirstRow,
  handleRowValidation,
  warnings = new Set(),
  locations,
  shouldSkipIdColumn,
  shouldShowEditedCellsAsMarked,
}: Props): JSX.Element {
  /**
   * Below preps the metadata values form should initialize to.
   *
   * Initialization happens in one of two cases:
   * 1) User is visiting Metadata step for first time, everything empty.
   * 2) User is coming back to Metadata after having previously entered data,
   * such as if they enter data, progress to Review, then come back.
   *
   * In both cases above, we initialize the form to start its values based on
   * the upstream `metadata` **when the component mounts**. This handles both
   * cases because for (1), the upstream metadata will start off empty because
   * nothing has been entered yet (in the case of sample upload), while for (2)
   * it will start off as the info that's been entered so far since we are
   * navigating back so far since we are navigating back to Metadata and
   * this component must re-mount and thus re-fetch metadata entered so far.
   *
   * We do it this way because if we instead rely on `enableReinitialize: true`
   * to keep the values in sync with upstream metadata, the form will
   * constantly churn as it gets re-inited, losing any info on `touched`, etc.
   *
   * IMPORTANT NOTE: container-level `metadata` in parent somewhere above must
   * initialize each sample's metadata object to being a valid Metadata type.
   * (Currently done by initializing all to EMPTY_METADATA when samples change,
   * but the important part is we need to be able to trust incoming `metadata`
   * as starting off sane.)
   */
  // Init formik values based on metadata during mount. See above for why.
  // In theory, shouldn't be necessary since Formik won't re-init when values
  // change, but I (Vince) have seen some weirdness if Formik sees change.
  const metadataOnMount = useMemo(() => metadata, []);

  const formik = useFormik({
    initialValues: metadataOnMount,
    onSubmit: noop,
    validationSchema,
    // Formik defaults to considering the form valid when it inits, but ours is
    // not valid at start. We need to explicitly set an error that is true when
    // it loads so it does not prematurely consider the form valid.
    // Could also do this via `validateOnMount`, but validate call is somewhat
    // heavy so when we mount 100+ Rows at once it can lock things up.
    initialErrors: { collectionDate: "Required" },
  });

  const { values, isValid, setTouched, setValues } = formik;

  // If user has uploaded a file of metadata, consider all fields touched for
  // purposes of displaying validation warnings to them ("Required", etc)
  useEffect(() => {
    if (hasImportedMetadataFile) {
      const touchedFields: Record<string, boolean> = {};
      Object.keys(values).forEach((fieldKey) => {
        touchedFields[fieldKey] = true;
      });
      setTouched(
        touchedFields,
        true // Explicitly trigger validation to run
        // NOTE: Above might cause unnecessary re-renders. If need to squeeze
        // out more performance, could set touched from EMPTY_METADATA instead
        // and drop `values` from the dependency list so this would only ever
        // fire once per mount.
      );
    }
  }, [hasImportedMetadataFile, setTouched, values]);

  useEffect(() => {
    handleRowValidation(id, isValid);
  }, [isValid, handleRowValidation, id]);

  /**
   * If upstream value is changed, update metadata and vice-versa.
   *
   * The values in form are bi-directional with the `metadata` from upstream:
   * if user edits a cell's value in table, the metadata is updated to reflect
   * that change. However, the upstream metadata can also be changed in other
   * ways (eg, uploading a file, clicking "Apply to All" for column) than
   * directly editing a cell. In those cases, the upstream metadata changes,
   * that passes down to the form level, and we update the form's values to
   * keep it in sync.
   */
  // Form values change ==> Update the metadata
  useEffect(() => {
    if (!deepEqual(metadata, values)) {
      handleMetadata(id, values);
    }
  }, [values]);
  // Metadata changes ==> Update the form values
  useEffect(() => {
    if (!deepEqual(metadata, values)) {
      setValues(metadata);
    }
  }, [metadata]);

  return (
    <StyledTableRow component="div">
      {!shouldSkipIdColumn && (
        <StyledTableCell component="div">
          <Id>{id}</Id>
        </StyledTableCell>
      )}
      <StyledTableCell component="div">
        <FreeTextField
          formik={formik}
          fieldKey="privateId"
          shouldShowEditedCellsAsMarked={shouldShowEditedCellsAsMarked}
        />
      </StyledTableCell>
      <StyledTableCell component="div">
        <FreeTextField
          formik={formik}
          fieldKey="publicId"
          shouldShowEditedCellsAsMarked={shouldShowEditedCellsAsMarked}
        />
      </StyledTableCell>
      <StyledTableCell component="div">
        <StyledDiv>
          <UploadDateField
            isFirstRow={isFirstRow}
            applyToAllColumn={applyToAllColumn}
            formik={formik}
            fieldKey="collectionDate"
            shouldShowEditedCellsAsMarked={shouldShowEditedCellsAsMarked}
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
          shouldShowEditedCellsAsMarked={shouldShowEditedCellsAsMarked}
        />
      </StyledTableCell>
      <StyledTableCell component="div">
        <StyledDiv>
          <UploadDateField
            isFirstRow={isFirstRow}
            applyToAllColumn={applyToAllColumn}
            formik={formik}
            fieldKey="sequencingDate"
            shouldShowEditedCellsAsMarked={shouldShowEditedCellsAsMarked}
          />
        </StyledDiv>
      </StyledTableCell>
      <IsPrivateTableCell align="center" component="div">
        <ToggleField
          formik={formik}
          fieldKey="keepPrivate"
          isAutocorrected={warnings.has("keepPrivate")}
        />
      </IsPrivateTableCell>
    </StyledTableRow>
  );
});
