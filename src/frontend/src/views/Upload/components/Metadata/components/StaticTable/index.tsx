import { Table as MuiTable, TableBody, TableHead } from "@mui/material";
import { useEffect, useCallback } from "react";
import { SAMPLE_UPLOAD_METADATA_KEYS_TO_HEADERS } from "src/components/DownloadMetadataTemplate/common/constants";
import { Props as CommonProps } from "../../../common/types";
import Row from "./components/Row";
import {
  IdColumn,
  IsPrivateTableCell,
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
import * as yup from "yup";
import { SampleIdToMetadata } from "src/components/WebformTable/common/types";

interface Props {
  metadata: CommonProps["metadata"];
  setIsValid: React.Dispatch<React.SetStateAction<boolean>>;
}

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

export default function StaticTable({ metadata, setIsValid }: Props): JSX.Element {

  const validateMetadata = useCallback(async (metadata: SampleIdToMetadata | null) => {
    if (metadata == null) {
      setIsValid(false);
      return;
    }
    const rowValidation: Record<string, boolean> = {}
    for (const [sampleId, sampleMetadata] of Object.entries(metadata)) {
      const isRowValid = await validationSchema.isValid(sampleMetadata)
      rowValidation[sampleId] = isRowValid
    }
    const isValid = Object.keys(metadata).every(
      (sampleId) => rowValidation[sampleId]
    );
    setIsValid(isValid);
  }, [])

  useEffect(() => {
    validateMetadata(metadata)
  }, [metadata]);


  return (
    <Overflow>
      <form autoComplete="off">
        <StyledTableContainer>
          <MuiTable component="div" stickyHeader>
            <TableHead component="div">
              {/* eslint-disable-next-line @typescript-eslint/ban-ts-comment */}
              {/* @ts-ignore: spread types error */}
              <StyledTableRow {...({ component: "div" } as unknown)}>
                <StyledTableCell component="div">
                  <IdColumn>
                    {SAMPLE_UPLOAD_METADATA_KEYS_TO_HEADERS.sampleId}
                  </IdColumn>
                </StyledTableCell>
                <StyledTableCell component="div">
                  {SAMPLE_UPLOAD_METADATA_KEYS_TO_HEADERS.privateId}
                </StyledTableCell>
                <StyledTableCell component="div">
                  {SAMPLE_UPLOAD_METADATA_KEYS_TO_HEADERS.publicId}
                </StyledTableCell>
                <StyledTableCell component="div">
                  {SAMPLE_UPLOAD_METADATA_KEYS_TO_HEADERS.collectionDate}
                </StyledTableCell>
                <StyledTableCell component="div">
                  {SAMPLE_UPLOAD_METADATA_KEYS_TO_HEADERS.collectionLocation}
                </StyledTableCell>
                <StyledTableCell component="div">
                  {SAMPLE_UPLOAD_METADATA_KEYS_TO_HEADERS.sequencingDate}
                </StyledTableCell>
                <IsPrivateTableCell align="center" component="div">
                  {SAMPLE_UPLOAD_METADATA_KEYS_TO_HEADERS.keepPrivate}
                </IsPrivateTableCell>
              </StyledTableRow>
            </TableHead>
            {metadata && (
              <TableBody component="div">
                {Object.entries(metadata).map(([sampleId, sampleMetadata]) => {
                  return (
                    <Row
                      key={sampleId}
                      id={sampleId}
                      metadata={sampleMetadata}
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
