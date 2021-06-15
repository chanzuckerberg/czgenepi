import { Table as MuiTable, TableBody, TableRow } from "@material-ui/core";
import React from "react";
import { Samples } from "../../../common/types";
import {
  Overflow,
  StyledHeaderTableCell,
  StyledTableCell,
  StyledTableContainer,
  StyledTableHead,
} from "./style";

interface Props {
  samples: Samples;
}

export default function Table({ samples }: Props): JSX.Element {
  return (
    <Overflow>
      <StyledTableContainer>
        <MuiTable aria-label="simple table" component="div">
          <StyledTableHead {...({ component: "div" } as unknown)}>
            <TableRow component="div">
              <StyledHeaderTableCell component="div">
                Sample Private ID
              </StyledHeaderTableCell>
              <StyledHeaderTableCell align="left" component="div">
                File Name
              </StyledHeaderTableCell>
            </TableRow>
          </StyledTableHead>
          <TableBody component="div">
            {Object.entries(samples).map(([key, value]) => (
              <TableRow key={key} component="div">
                <StyledTableCell scope="row" component="div">
                  {key}
                </StyledTableCell>
                <StyledTableCell align="left" component="div">
                  {value.filename}
                </StyledTableCell>
              </TableRow>
            ))}
          </TableBody>
        </MuiTable>
      </StyledTableContainer>
    </Overflow>
  );
}
