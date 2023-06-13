import { Table as MuiTable, TableBody, TableRow } from "@mui/material";
import { map } from "lodash";
import {
  BASE_ERROR_CODE,
  ERROR_CODE,
} from "src/components/WebformTable/common/types";
import { ParseErrors } from "../../../common/types";
import {
  Overflow,
  StyledHeaderTableCell,
  StyledTableCell,
  StyledTableContainer,
  StyledTableHead,
  StyledTableRow,
} from "./style";

const ERROR_CODE_MESSAGES: Record<BASE_ERROR_CODE, string> = {
  [ERROR_CODE.DEFAULT]:
    "Something went wrong and we are unable to read this file. Please check the file or contact us for help.",
  [ERROR_CODE.INVALID_NAME]:
    "Sample Name (from FASTA) did not meet our requirements, please update and retry. Sample names must be no longer than 120 characters and can only contain letters from the English alphabet (A-Z, upper and lower case), numbers (0-9), periods (.), hyphens (-), underscores (_), and forward slashes (/).",
  [ERROR_CODE.MISSING_FIELD]: "placeholder",
};

interface Props {
  parseErrors: ParseErrors;
}

export default function AlertTable({ parseErrors }: Props): JSX.Element {
  return (
    <Overflow>
      <StyledTableContainer>
        <MuiTable aria-label="simple table" component="div">
          {/* eslint-disable-next-line @typescript-eslint/ban-ts-comment */}
          {/* @ts-ignore: spread types error */}
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
            {map(parseErrors, (names: string[], errorCode: BASE_ERROR_CODE) => (
              <StyledTableRow key={errorCode} component="div">
                <StyledTableCell scope="row" component="div">
                  {names.join(", ")}
                </StyledTableCell>
                <StyledTableCell align="left" component="div">
                  {ERROR_CODE_MESSAGES[errorCode]}
                </StyledTableCell>
              </StyledTableRow>
            ))}
          </TableBody>
        </MuiTable>
      </StyledTableContainer>
    </Overflow>
  );
}
