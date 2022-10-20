import { Table as MuiTable, TableBody, TableHead } from "@mui/material";
import { useEffect, useCallback, useState } from "react";
import { SAMPLE_UPLOAD_METADATA_KEYS_TO_HEADERS } from "src/components/DownloadMetadataTemplate/common/constants";
import { EMPTY_OBJECT } from "src/common/constants/empty";
import { Props as CommonProps } from "../../../common/types";
import { Metadata } from "src/components/WebformTable/common/types";
import Row from "./components/Row";
import {
  IdColumn,
  PrivateTableCell,
  Overflow,
  StyledTableCell,
  StyledTableContainer,
  StyledTableRow,
} from "./style";
import {
  MAX_NAME_LENGTH,
  VALID_NAME_REGEX,
} from "src/views/Upload/components/common/constants";
import {
  DATE_ERROR_MESSAGE,
  DATE_REGEX,
} from "src/components/DateField/constants";
import { object, string, number, ValidationError } from "yup";
import { SampleIdToMetadata } from "src/components/WebformTable/common/types";
import { SampleIdToWarningMessages } from "../ImportFile/parseFile";

interface Props {
  metadata: CommonProps["metadata"];
  setIsValid: React.Dispatch<React.SetStateAction<boolean>>;
  hasImportedMetadataFile: boolean;
  autocorrectWarnings: SampleIdToWarningMessages;
}

export interface ValidationErrorRecord {
  collectionDate?: string;
  collectionLocation?: string;
  sequencingDate?: string;
  privateId?: string;
}

const validationSchema = object({
  collectionDate: string()
    .matches(DATE_REGEX, DATE_ERROR_MESSAGE)
    .min(10, DATE_ERROR_MESSAGE)
    .max(10, DATE_ERROR_MESSAGE)
    .required("Required"),
  collectionLocation: object({
      id: number().required(),
    })
    .required("Required"),
  sequencingDate: string()
    .notRequired()
    .matches(DATE_REGEX, DATE_ERROR_MESSAGE)
    .min(10, DATE_ERROR_MESSAGE)
    .max(10, DATE_ERROR_MESSAGE)
    .nullable()
    .transform((value) => value ? value : null),
  privateId: string()
    .required("Required")
    .matches(VALID_NAME_REGEX, "Invalid character(s)")
    .max(MAX_NAME_LENGTH, "Too long"),
});

export default function StaticTable({ metadata, setIsValid, hasImportedMetadataFile }: Props): JSX.Element {
  const [validationErrors, setValidationErrors] = useState<Record<string, ValidationErrorRecord | null>>(EMPTY_OBJECT);

  // This function validates metadata by creating a mapping of sample ids to
  // either null or a ValidationErrorRecord, an object which is itself a mapping
  // from the key(s) that failed to validate to the specific error message.
  // The function then determines if the metadata as a whole is valid by
  // checking that each sampleId maps to null.
  // If one field has multiple error messages we just overwrite the message in 
  // the ValidationErrorRecord, since we only want to display one error at a time.
  const validateMetadata = useCallback(async (metadata: SampleIdToMetadata | null) => {
    if (metadata == null) {
      setIsValid(false);
      return;
    }
    const validationErrors: Record<string, ValidationErrorRecord | null> = Object.fromEntries(
      Object.keys(metadata).map(sampleId => [sampleId, null])
    );
    for (const [sampleId, sampleMetadata] of Object.entries(metadata)) {
      try {
        await validationSchema.validate(sampleMetadata, { "abortEarly": false });
      } catch (error) {
        if (error instanceof ValidationError) {
          const errorRecord: ValidationErrorRecord = {}
          error.inner.forEach(validationError => {
            if (validationError.path != undefined) {
              const rootMetadataKey = validationError.path.split(".")[0]
              errorRecord[rootMetadataKey as keyof ValidationErrorRecord] = validationError.message
            }
          })
          validationErrors[sampleId] = errorRecord;
        } else {
          throw error
        }
      }
    }
    const isValid = Object.keys(metadata).every(
      (sampleId) => validationErrors[sampleId] == null
    );
    setValidationErrors(validationErrors);
    setIsValid(isValid);
  }, [metadata]);

  useEffect(() => {
    if (hasImportedMetadataFile) {
      validateMetadata(metadata);
    }
  }, [metadata, hasImportedMetadataFile]);

  // Sort entries by error status, then by sampleId
  let errorSortedMetadata: [string, Metadata][] = []
  if (metadata != null) {
    errorSortedMetadata = Object.entries(metadata).map(([sampleId, sampleMetadata]) => {
      return [sampleId, sampleMetadata] as [string, Metadata];
    }).sort((a, b) => {
      const a_error_sort = validationErrors[a[0]] == null ? 1 : 0;
      const b_error_sort = validationErrors[b[0]] == null ? 1 : 0;
      if (a_error_sort == b_error_sort) {
        return a[0].localeCompare(b[0]);
      } else if (a_error_sort < b_error_sort) {
        return -1;
      } else if (a_error_sort > b_error_sort) {
        return 1;
      }
      return 0
    })
  }


  return (
    <Overflow>
      <StyledTableContainer>
        <MuiTable stickyHeader>
          <TableHead>
            <StyledTableRow>
              <StyledTableCell>
                <IdColumn>
                  {SAMPLE_UPLOAD_METADATA_KEYS_TO_HEADERS.sampleId}
                </IdColumn>
              </StyledTableCell>
              <StyledTableCell>
                {SAMPLE_UPLOAD_METADATA_KEYS_TO_HEADERS.privateId}
              </StyledTableCell>
              <StyledTableCell>
                {SAMPLE_UPLOAD_METADATA_KEYS_TO_HEADERS.publicId}
              </StyledTableCell>
              <StyledTableCell>
                {SAMPLE_UPLOAD_METADATA_KEYS_TO_HEADERS.collectionDate}
              </StyledTableCell>
              <StyledTableCell>
                {SAMPLE_UPLOAD_METADATA_KEYS_TO_HEADERS.collectionLocation}
              </StyledTableCell>
              <StyledTableCell>
                {SAMPLE_UPLOAD_METADATA_KEYS_TO_HEADERS.sequencingDate}
              </StyledTableCell>
              <PrivateTableCell align="center">
                {SAMPLE_UPLOAD_METADATA_KEYS_TO_HEADERS.keepPrivate}
              </PrivateTableCell>
            </StyledTableRow>
          </TableHead>
          {metadata && (
            <TableBody>
              {errorSortedMetadata.map(([sampleId, sampleMetadata]) => {
                let validationError = null;
                if (Object.prototype.hasOwnProperty.call(validationErrors, sampleId)) {
                  validationError = validationErrors[sampleId]
                }
                return (
                  <Row
                    key={sampleId}
                    id={sampleId}
                    metadata={sampleMetadata}
                    validationError={validationError}
                  />
                );
              })}
            </TableBody>
          )}
        </MuiTable>
      </StyledTableContainer>
    </Overflow>
  );
}
