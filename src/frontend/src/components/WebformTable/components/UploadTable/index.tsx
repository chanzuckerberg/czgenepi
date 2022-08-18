import { Table as MuiTable, TableBody, TableHead } from "@mui/material";
import React from "react";
import { SAMPLE_UPLOAD_METADATA_KEYS_TO_HEADERS } from "src/components/DownloadMetadataTemplate/common/constants";
import { Metadata } from "src/components/WebformTable/common/types";
import {
  NamedGisaidLocation,
  Props as CommonProps,
} from "src/views/Upload/components/common/types";
import { SampleIdToWarningMessages } from "src/views/Upload/components/Metadata/components/ImportFile/parseFile";
import {
  IdColumn,
  IsPrivateTableCell,
  StyledTableCell,
  StyledTableRow,
} from "../../style";
import Row from "../Row";

export interface TableProps {
  metadata: CommonProps["metadata"];
  hasImportedMetadataFile: boolean;
  handleRowMetadata(id: string, sampleMetadata: Metadata): void;
  applyToAllColumn(fieldKey: keyof Metadata, value: unknown): void;
  handleRowValidation(id: string, isValid: boolean): void;
  setMetadata: CommonProps["setMetadata"];
  setIsValid: React.Dispatch<React.SetStateAction<boolean>>;
  autocorrectWarnings: SampleIdToWarningMessages;
  locations: NamedGisaidLocation[];
}

export default function UploadTable({
  metadata,
  hasImportedMetadataFile,
  handleRowMetadata,
  applyToAllColumn,
  handleRowValidation,
  autocorrectWarnings,
  locations,
}: TableProps): JSX.Element {
  return (
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
          {Object.entries(metadata).map(([sampleId, sampleMetadata], index) => {
            return (
              <Row
                isFirstRow={index === 0}
                key={sampleId}
                id={sampleId}
                metadata={sampleMetadata}
                hasImportedMetadataFile={hasImportedMetadataFile}
                handleMetadata={handleRowMetadata}
                applyToAllColumn={applyToAllColumn}
                handleRowValidation={handleRowValidation}
                // TODO (phoenix) remove this workaround once autocorrect warnings are added for sample update
                warnings={autocorrectWarnings && autocorrectWarnings[sampleId]}
                locations={locations}
              />
            );
          })}
        </TableBody>
      )}
    </MuiTable>
  );
}
