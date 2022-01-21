import { Table as MuiTable, TableBody, TableHead } from "@material-ui/core";
import React from "react";
import { METADATA_KEYS_TO_HEADERS } from "../../../common/constants";
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

interface Props {
  metadata: CommonProps["metadata"];
}

export default function Table({ metadata }: Props): JSX.Element {
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
                <StyledTableCell align="center" component="div">
                  {METADATA_KEYS_TO_HEADERS.submittedToGisaid}
                </StyledTableCell>
                <StyledTableCell component="div">
                  {METADATA_KEYS_TO_HEADERS.publicId}
                </StyledTableCell>
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
