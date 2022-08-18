import { Table as MuiTable, TableBody, TableHead } from "@material-ui/core";
import React from "react";
import { SAMPLE_EDIT_WEBFORM_METADATA_KEYS_TO_HEADERS } from "../../common/constants";
import {
  IsPrivateTableCell,
  StyledTableCell,
  StyledTableRow,
} from "../../style";
import Row from "../Row";
import { TableProps } from "../UploadTable";

export default function EditTable({
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
        <StyledTableRow {...({ component: "div" } as Record<string, unknown>)}>
          <StyledTableCell component="div">
            {SAMPLE_EDIT_WEBFORM_METADATA_KEYS_TO_HEADERS.privateId}
          </StyledTableCell>
          <StyledTableCell component="div">
            {SAMPLE_EDIT_WEBFORM_METADATA_KEYS_TO_HEADERS.publicId}
          </StyledTableCell>
          <StyledTableCell component="div">
            {SAMPLE_EDIT_WEBFORM_METADATA_KEYS_TO_HEADERS.collectionDate}
          </StyledTableCell>
          <StyledTableCell component="div">
            {SAMPLE_EDIT_WEBFORM_METADATA_KEYS_TO_HEADERS.collectionLocation}
          </StyledTableCell>
          <StyledTableCell component="div">
            {SAMPLE_EDIT_WEBFORM_METADATA_KEYS_TO_HEADERS.sequencingDate}
          </StyledTableCell>
          <IsPrivateTableCell align="center" component="div">
            {SAMPLE_EDIT_WEBFORM_METADATA_KEYS_TO_HEADERS.keepPrivate}
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
                warnings={autocorrectWarnings[sampleId]}
                locations={locations}
                shouldSkipIdColumn
                shouldShowEditedInputAsMarked
              />
            );
          })}
        </TableBody>
      )}
    </MuiTable>
  );
}
