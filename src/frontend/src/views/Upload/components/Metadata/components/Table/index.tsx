import { Table as MuiTable, TableBody, TableHead } from "@material-ui/core";
import React, { useCallback, useEffect, useState } from "react";
import { EMPTY_OBJECT } from "src/common/constants/empty";
import { METADATA_KEYS_TO_HEADERS } from "../../../common/constants";
import { Metadata, Props as CommonProps } from "../../../common/types";
import Row from "./components/Row";
import {
  IdColumn,
  IsPrivateTableCell,
  Overflow,
  StyledTableCell,
  StyledTableContainer,
  StyledTableRow,
  SubmittedToGisaidTableCell,
} from "./style";

interface Props {
  metadata: CommonProps["metadata"];
  setMetadata: CommonProps["setMetadata"];
  setIsValid: React.Dispatch<React.SetStateAction<boolean>>;
  hasImportedFile: boolean;
  autocorrectWarnings: string[];
}

export default function Table({
  metadata,
  setMetadata,
  setIsValid,
  hasImportedFile,
  autocorrectWarnings,
}: Props): JSX.Element {
  const [isTouched, setIsTouched] = useState(hasImportedFile);

  const [rowValidation, setRowValidation] =
    useState<Record<string, boolean>>(EMPTY_OBJECT);

  useEffect(() => {
    if (hasImportedFile) {
      setIsTouched(true);
    }
  }, [hasImportedFile]);

  useEffect(() => {
    const isValid = Object.values(rowValidation).every((isValid) => isValid);

    setIsValid(isValid);
  }, [rowValidation]);

  const handleRowValidation_ = (id: string, isValid: boolean) => {
    if (rowValidation[id] === isValid) return;

    setRowValidation((prevState) => ({ ...prevState, [id]: isValid }));
  };

  const handleRowValidation = useCallback(handleRowValidation_, []);

  const handleRowMetadata_ = (id: string, sampleMetadata: Metadata) => {
    setMetadata((prevMetadata) => {
      return { ...prevMetadata, [id]: sampleMetadata };
    });
  };

  const handleRowMetadata = useCallback(handleRowMetadata_, []);

  const applyToAllColumn_ = (fieldKey: keyof Metadata, value: unknown) => {
    setMetadata((prevMetadata) => {
      const newMetadata: CommonProps["metadata"] = {};

      for (const [sampleId, sampleMetadata] of Object.entries(
        prevMetadata || EMPTY_OBJECT
      )) {
        newMetadata[sampleId] = {
          ...(sampleMetadata as Record<string, unknown>),
          [fieldKey]: value,
        };
      }

      return newMetadata;
    });
  };

  const applyToAllColumn = useCallback(applyToAllColumn_, []);

  return (
    <Overflow>
      <form autoComplete="off">
        <StyledTableContainer>
          <MuiTable component="div" stickyHeader>
            <TableHead component="div">
              <StyledTableRow {...({ component: "div" } as unknown)}>
                <StyledTableCell component="div">
                  <IdColumn>{METADATA_KEYS_TO_HEADERS.sampleId}</IdColumn>
                </StyledTableCell>
                <StyledTableCell component="div">
                  {METADATA_KEYS_TO_HEADERS.collectionDate}
                </StyledTableCell>
                <StyledTableCell component="div">
                  {METADATA_KEYS_TO_HEADERS.collectionLocation}
                </StyledTableCell>
                <StyledTableCell component="div">
                  {METADATA_KEYS_TO_HEADERS.sequencingDate}
                </StyledTableCell>
                <IsPrivateTableCell align="center" component="div">
                  {METADATA_KEYS_TO_HEADERS.keepPrivate}
                </IsPrivateTableCell>
                <SubmittedToGisaidTableCell align="center" component="div">
                  {METADATA_KEYS_TO_HEADERS.submittedToGisaid}
                </SubmittedToGisaidTableCell>
                <StyledTableCell component="div">
                  {METADATA_KEYS_TO_HEADERS.publicId}
                </StyledTableCell>
                <StyledTableCell component="div">
                  {METADATA_KEYS_TO_HEADERS.islAccessionNumber}
                </StyledTableCell>
              </StyledTableRow>
            </TableHead>
            {metadata && (
              <TableBody component="div">
                {Object.entries(metadata).map(
                  ([sampleId, sampleMetadata], index) => {
                    return (
                      <Row
                        isTouched={isTouched}
                        isFirstRow={index === 0}
                        key={sampleId}
                        id={sampleId}
                        metadata={sampleMetadata}
                        handleMetadata={handleRowMetadata}
                        applyToAllColumn={applyToAllColumn}
                        handleRowValidation={handleRowValidation}
                        isAutocorrected={autocorrectWarnings.includes(sampleId)}
                      />
                    );
                  }
                )}
              </TableBody>
            )}
          </MuiTable>
        </StyledTableContainer>
      </form>
    </Overflow>
  );
}
