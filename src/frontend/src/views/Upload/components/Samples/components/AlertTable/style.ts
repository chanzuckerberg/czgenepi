import styled from "@emotion/styled";
import {
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableRowProps as MuiTableRowProps,
} from "@mui/material";
import { CommonThemeProps, fontBodyXs, fontHeaderXs, getColors } from "czifui";

export const Overflow = styled.div`
  overflow: auto;
`;

export const StyledTableContainer = styled(TableContainer)`
  max-height: 450px;
`;

export const StyledTableCell = styled(TableCell)`
  ${fontBodyXs}
  border-bottom: none;
  width: 50%;
  vertical-align: top;
`;

export const StyledHeaderTableCell = styled(TableCell)`
  ${fontHeaderXs}
  border-bottom: none;
  width: 50%;
`;

export const StyledTableHead = styled(TableHead)`
  ${fontHeaderXs}
`;

interface TableRowProps extends MuiTableRowProps, CommonThemeProps {
  component: "div";
}

export const StyledTableRow = styled(TableRow)`
  &:nth-of-type(odd) {
    ${(props: TableRowProps) => {
      const colors = getColors(props);
      return `
        background-color: ${colors?.error[100]};
      `;
    }}
  }
`;
