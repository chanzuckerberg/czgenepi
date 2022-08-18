import { Table as MuiTable, TableBody, TableHead } from "@material-ui/core";
import React from "react";
import { SAMPLE_EDIT_METADATA_KEYS_TO_HEADERS } from "src/components/DownloadMetadataTemplate/common/constants";
import {
  IdColumn,
  IsPrivateTableCell,
  Overflow,
  StyledTableCell,
  StyledTableContainer,
  StyledTableRow,
} from "src/views/Upload/components/Review/components/Table/style";
import { MetadataWithIdType } from "../../index";
import Row from "./components/Row";

interface Props {
  metadata: MetadataWithIdType;
}

const Table = ({ metadata }: Props): JSX.Element => {
  return (
    <Overflow>
      <form autoComplete="off">
        <StyledTableContainer>
          <MuiTable component="div" stickyHeader>
            <TableHead component="div">
              <StyledTableRow {...({ component: "div" } as Record<string, unknown>)}>
                <StyledTableCell component="div">
                  <IdColumn>Private ID</IdColumn>
                </StyledTableCell>
                <StyledTableCell component="div">
                  {SAMPLE_EDIT_METADATA_KEYS_TO_HEADERS.publicId}
                </StyledTableCell>
                <StyledTableCell component="div">
                  {SAMPLE_EDIT_METADATA_KEYS_TO_HEADERS.collectionDate}
                </StyledTableCell>
                <StyledTableCell component="div">
                  {SAMPLE_EDIT_METADATA_KEYS_TO_HEADERS.collectionLocation}
                </StyledTableCell>
                <StyledTableCell component="div">
                  Sequencing Date
                </StyledTableCell>
                <IsPrivateTableCell align="center" component="div">
                  Privacy
                </IsPrivateTableCell>
              </StyledTableRow>
            </TableHead>
            {metadata && (
              <TableBody component="div">
                {Object.entries(metadata).map(([sampleId, sampleMetadata]) => {
                  return <Row key={sampleId} metadata={sampleMetadata} />;
                })}
              </TableBody>
            )}
          </MuiTable>
        </StyledTableContainer>
      </form>
    </Overflow>
  );
};

export { Table };
