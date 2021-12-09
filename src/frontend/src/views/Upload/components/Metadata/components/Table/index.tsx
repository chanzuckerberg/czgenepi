import { Table as MuiTable, TableBody, TableHead } from "@material-ui/core";
import { reduce } from "lodash";
import React, { useCallback, useEffect, useState } from "react";
import { EMPTY_OBJECT } from "src/common/constants/empty";
import {
  METADATA_KEYS_TO_HEADERS,
  SAMPLE_COUNT,
} from "../../../common/constants";
import {
  Metadata,
  NamedGisaidLocation,
  Props as CommonProps,
} from "../../../common/types";
import { SampleIdToWarningMessages } from "../ImportFile/parseFile";
import Row from "./components/Row";
import {
  IdColumn,
  IsPrivateTableCell,
  LoadingMessage,
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
  autocorrectWarnings: SampleIdToWarningMessages;
  locations: NamedGisaidLocation[];
}

export default function Table({
  metadata,
  setMetadata,
  setIsValid,
  hasImportedFile,
  autocorrectWarnings,
  locations,
}: Props): JSX.Element {
  const [isTouched, setIsTouched] = useState(hasImportedFile);
  const [isReadyToRenderTable, setIsReadyToTenderTable] = useState(false);

  const [rowValidation, setRowValidation] =
    useState<Record<string, boolean>>(EMPTY_OBJECT);

  useEffect(() => {
    if (!metadata) {
      return setIsReadyToTenderTable(true);
    }

    const timeout = setTimeout(
      () => {
        setIsReadyToTenderTable(true);
      },
      Object.keys(metadata).length > SAMPLE_COUNT ? 1 * 1000 : 0
    );

    return () => clearTimeout(timeout);
  }, [metadata]);

  useEffect(() => {
    if (hasImportedFile) {
      setIsTouched(true);
    }
  }, [hasImportedFile]);

  useEffect(() => {
    const isValid = Object.values(rowValidation).every((isValid) => isValid);

    setIsValid(isValid);
  }, [rowValidation, setIsValid]);

  const handleRowValidation_ = (id: string, isValid: boolean) => {
    if (rowValidation[id] === isValid) return;

    setRowValidation((prevState) => ({ ...prevState, [id]: isValid }));
  };

  const handleRowValidation = useCallback(handleRowValidation_, [
    rowValidation,
  ]);

  const handleRowMetadata_ = (id: string, sampleMetadata: Metadata) => {
    setMetadata((prevMetadata) => {
      return { ...prevMetadata, [id]: sampleMetadata };
    });
  };

  const handleRowMetadata = useCallback(handleRowMetadata_, [setMetadata]);

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

  const applyToAllColumn = useCallback(applyToAllColumn_, [setMetadata]);

  if (!isReadyToRenderTable) {
    return (
      <Overflow>
        <LoadingMessage>Loading form...</LoadingMessage>
      </Overflow>
    );
  }

  const shouldShowGISAIDFields = reduce(
    metadata,
    (shouldShow, data) => {
      if (shouldShow) return true;
      if (data?.submittedToGisaid) return true;
      return false;
    },
    false
  );

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
                {shouldShowGISAIDFields && (
                  <>
                    <StyledTableCell component="div">
                      {METADATA_KEYS_TO_HEADERS.publicId}
                    </StyledTableCell>
                    <StyledTableCell component="div">
                      {METADATA_KEYS_TO_HEADERS.islAccessionNumber}
                    </StyledTableCell>
                  </>
                )}
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
                        warnings={autocorrectWarnings[sampleId]}
                        locations={locations}
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
