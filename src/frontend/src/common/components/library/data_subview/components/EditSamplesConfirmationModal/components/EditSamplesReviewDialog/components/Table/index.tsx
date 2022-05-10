import { Table as MuiTable, TableBody, TableHead } from "@material-ui/core";
import React from "react";
import { Props as CommonProps } from "src/views/Upload/components/common/types";
import {
  IdColumn,
  IsPrivateTableCell,
  Overflow,
  StyledTableCell,
  StyledTableContainer,
  StyledTableRow,
} from "src/views/upload/components/Review/components/Table/style";

interface Props {
  metadata: CommonProps["metadata"];
}

const Table = ({ metadata }: Props): JSX.Element => {
  return (
    <Overflow>
      <form autoComplete="off">
        <StyledTableContainer>
          <MuiTable component="div" stickyHeader>
            <TableHead component="div">
              <StyledTableRow {...({ component: "div" } as unknown)}>
                <StyledTableCell component="div">
                  <IdColumn>Private ID</IdColumn>
                </StyledTableCell>
                <StyledTableCell component="div">
                  Public ID (GISAID ID)
                </StyledTableCell>
                <StyledTableCell component="div">
                  Collection Date
                </StyledTableCell>
                <StyledTableCell component="div">
                  Collection Location
                </StyledTableCell>
                <StyledTableCell component="div">
                  Sequencing Date
                </StyledTableCell>
                <IsPrivateTableCell align="center" component="div">
                  Privacy
                </IsPrivateTableCell>
              </StyledTableRow>
            </TableHead>
            {metadata && <TableBody component="div"></TableBody>}
          </MuiTable>
        </StyledTableContainer>
      </form>
    </Overflow>
  );
};

export { Table };
