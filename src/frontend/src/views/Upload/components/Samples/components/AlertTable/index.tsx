import { Table as MuiTable, TableBody, TableRow } from "@material-ui/core";
import React from "react";
import { ERROR_CODE, ParseErrors } from "../../../common/types";
import {
  Overflow,
  StyledHeaderTableCell,
  StyledTableCell,
  StyledTableContainer,
  StyledTableHead,
  StyledTableRow,
} from "./style";

const ERROR_CODE_MESSAGES: Record<ERROR_CODE, string> = {
  [ERROR_CODE.DEFAULT]:
    "Something went wrong and we are unable to read this file. Please check the file or contact us for help.",
  [ERROR_CODE.INVALID_NAME]:
    "File or Sample Private ID did not meet our requirements, please update and retry. File and sample names must be no longer than 120 characters and can only contain letters from the English alphabet (A-Z, upper and lower case), numbers (0-9), periods (.), hyphens (-), underscores (_), and backslashes (/). Spaces are not allowed.  ",
  [ERROR_CODE.MISSING_FIELD]: "placeholder",
  [ERROR_CODE.OVER_MAX_SAMPLES]:
    "This file contains more than 500 samples, which exceeds the maximum for each upload process. Please limit the samples to 500 or less",
};

interface Props {
  parseErrors: ParseErrors;
}

export default function AlertTable({ parseErrors }: Props): JSX.Element {
  return (
    <Overflow>
      <StyledTableContainer>
        <MuiTable aria-label="simple table" component="div">
          <StyledTableHead {...({ component: "div" } as unknown)}>
            <TableRow component="div">
              <StyledHeaderTableCell component="div">
                Files
              </StyledHeaderTableCell>
              <StyledHeaderTableCell align="left" component="div">
                Reason for Failure
              </StyledHeaderTableCell>
            </TableRow>
          </StyledTableHead>
          <TableBody component="div">
            {Object.entries(parseErrors).map(([errorCode, names]) => (
              <StyledTableRow key={errorCode} component="div">
                <StyledTableCell scope="row" component="div">
                  {names.join(", ")}
                </StyledTableCell>
                <StyledTableCell align="left" component="div">
                  {ERROR_CODE_MESSAGES[errorCode as unknown as ERROR_CODE]}
                </StyledTableCell>
              </StyledTableRow>
            ))}
          </TableBody>
        </MuiTable>
      </StyledTableContainer>
    </Overflow>
  );
}
