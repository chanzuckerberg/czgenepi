import { useCallback, useEffect, useState } from "react";
import * as React from "react";
import { EMPTY_OBJECT } from "src/common/constants/empty";
import { Metadata } from "src/components/WebformTable/common/types";
import { SAMPLE_COUNT } from "src/views/Upload/components/common/constants";
import {
  NamedGisaidLocation,
  Props as CommonProps,
} from "src/views/Upload/components/common/types";
import { SampleIdToWarningMessages } from "src/views/Upload/components/Metadata/components/ImportFile/parseFile";
import EditTable from "./components/EditTable";
import UploadTable from "./components/UploadTable";
import { LoadingMessage, Overflow, StyledTableContainer } from "./style";

export enum WebformTableTypeOptions {
  Upload = "UPLOAD",
  Edit = "EDIT",
}

export type WebformTableType = Record<WebformTableTypeOptions, string>;

interface Props {
  metadata: CommonProps["metadata"];
  hasImportedMetadataFile: boolean;
  setMetadata: CommonProps["setMetadata"];
  // TODO: update value type to be something other than unknown
  applyToAllColumn(fieldKey: keyof Metadata, value: unknown): void;
  setIsValid: React.Dispatch<React.SetStateAction<boolean>>;
  handleRowMetadata(id: string, sampleMetadata: Metadata): void;
  autocorrectWarnings: SampleIdToWarningMessages;
  locations: NamedGisaidLocation[];
  webformTableType: string;
}

export function WebformTable({
  applyToAllColumn,
  metadata,
  hasImportedMetadataFile,
  setMetadata,
  setIsValid,
  autocorrectWarnings,
  handleRowMetadata,
  locations,
  webformTableType,
}: Props): JSX.Element {
  const [isReadyToRenderTable, setIsReadyToRenderTable] = useState(false);

  const [rowValidation, setRowValidation] =
    useState<Record<string, boolean>>(EMPTY_OBJECT);

  useEffect(() => {
    if (!metadata) {
      return setIsReadyToRenderTable(true);
    }

    const timeout = setTimeout(
      () => {
        setIsReadyToRenderTable(true);
      },
      Object.keys(metadata).length > SAMPLE_COUNT ? 1 * 1000 : 0
    );

    return () => clearTimeout(timeout);
  }, [metadata]);

  useEffect(() => {
    if (metadata === null) {
      setIsValid(false);
    } else {
      const isValid = Object.keys(metadata).every(
        (sampleId) => rowValidation[sampleId]
      );
      setIsValid(isValid);
    }
  }, [rowValidation, setIsValid]);

  const handleRowValidation_ = (id: string, isValid: boolean) => {
    if (rowValidation[id] === isValid) return;

    setRowValidation((prevState) => ({ ...prevState, [id]: isValid }));
  };

  const handleRowValidation = useCallback(handleRowValidation_, [
    rowValidation,
  ]);

  if (!isReadyToRenderTable) {
    return (
      <Overflow>
        <LoadingMessage>Loading form...</LoadingMessage>
      </Overflow>
    );
  }

  return (
    <Overflow>
      <form autoComplete="off">
        <StyledTableContainer>
          {webformTableType == WebformTableTypeOptions.Upload && (
            <UploadTable
              metadata={metadata}
              hasImportedMetadataFile={hasImportedMetadataFile}
              handleRowMetadata={handleRowMetadata}
              applyToAllColumn={applyToAllColumn}
              handleRowValidation={handleRowValidation}
              setMetadata={setMetadata}
              setIsValid={setIsValid}
              autocorrectWarnings={autocorrectWarnings}
              locations={locations}
            />
          )}
          {webformTableType == WebformTableTypeOptions.Edit && (
            <EditTable
              metadata={metadata}
              hasImportedMetadataFile={hasImportedMetadataFile}
              handleRowMetadata={handleRowMetadata}
              applyToAllColumn={applyToAllColumn}
              handleRowValidation={handleRowValidation}
              setMetadata={setMetadata}
              setIsValid={setIsValid}
              autocorrectWarnings={autocorrectWarnings}
              locations={locations}
            />
          )}
        </StyledTableContainer>
      </form>
    </Overflow>
  );
}
