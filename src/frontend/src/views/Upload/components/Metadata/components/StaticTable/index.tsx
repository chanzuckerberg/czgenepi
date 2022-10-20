import { Table as MuiTable, TableBody, TableHead } from "@mui/material";
import { useEffect, useCallback, useState } from "react";
import { SAMPLE_UPLOAD_METADATA_KEYS_TO_HEADERS } from "src/components/DownloadMetadataTemplate/common/constants";
import { EMPTY_OBJECT } from "src/common/constants/empty";
import { Props as CommonProps } from "../../../common/types";
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

interface Props {
  metadata: CommonProps["metadata"];
  setIsValid: React.Dispatch<React.SetStateAction<boolean>>;
}

interface ValidationErrorRecord {
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
    .transform((value) => !!value ? value : null),
  privateId: string()
    .required("Required")
    .matches(VALID_NAME_REGEX, "Invalid character(s)")
    .max(MAX_NAME_LENGTH, "Too long"),
});

export default function StaticTable({ metadata, setIsValid }: Props): JSX.Element {
  const [validationErrors, setValidationErrors] = useState<Record<string, ValidationErrorRecord | null>>(EMPTY_OBJECT);

  const validateMetadata = useCallback(async (metadata: SampleIdToMetadata | null) => {
    if (metadata == null) {
      setIsValid(false);
      return;
    }
    const validationErrors: Record<string, ValidationErrorRecord | null> = Object.fromEntries(Object.keys(metadata).map(sampleId => [sampleId, null]));
    for (const [sampleId, sampleMetadata] of Object.entries(metadata)) {
      try {
        const _ = await validationSchema.validate(sampleMetadata, { "abortEarly": false });
      } catch (error) {
        if (error instanceof ValidationError) {
          const errorRecord: ValidationErrorRecord = {}
          error.inner.forEach(validationError => {
            if (validationError.path != undefined) {
              errorRecord[validationError.path as keyof ValidationErrorRecord] = validationError.message
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
  }, []);

  useEffect(() => {
    validateMetadata(metadata);
  }, [metadata]);


  return (
    <Overflow>
      <form autoComplete="off">
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
                {Object.entries(metadata).map(([sampleId, sampleMetadata]) => {
                  let validationError = null;
                  if (Object.hasOwn(validationErrors, sampleId)) {
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
      </form>
    </Overflow>
  );
}
