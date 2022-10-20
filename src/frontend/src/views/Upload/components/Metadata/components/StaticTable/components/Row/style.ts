import styled from "@emotion/styled";
import {
  TableCell,
  TableRow,
  TableRowProps as MuiTableRowProps,
} from "@mui/material";
import { Callout, CommonThemeProps, fontHeaderS, getColors, getSpaces } from "czifui";
import { rightMarginXxs } from "src/common/styles/iconStyle";

export const Id = styled.p`
  ${fontHeaderS}

  min-width: 300px;

  justify-content: center;
  display: flex;
  flex-direction: column;

  ${(props: CommonThemeProps) => {
    const spaces = getSpaces(props);

    return `
      padding: ${spaces?.xs}px ${spaces?.m}px ${spaces?.xs}px ${spaces?.xs}px;
    `;
  }}
`;

interface TableRowProps extends MuiTableRowProps, CommonThemeProps {
}

export const StyledTableRow = styled(TableRow)`
  &:nth-of-type(even) {
    ${(props: TableRowProps) => {
      const colors = getColors(props);

      return `
        background-color: ${colors?.gray[100]};
      `;
    }}
  }
`;

export const StyledTableCell = styled(TableCell)`
  max-width: 300px;
  word-break: break-word;
  min-width: 150px;
  ${(props: CommonThemeProps) => {
    const spaces = getSpaces(props);

    return `
      padding: ${spaces?.xs}px;
    `;
  }}
`;

export const PrivateTableCell = styled(TableCell)`
  min-width: 100px;
  ${(props: CommonThemeProps) => {
    const spaces = getSpaces(props);
    const colors = getColors(props);

    return `
      padding: ${spaces?.xs}px;
      border-left: solid 2px ${colors?.gray[200]};
      border-right: solid 2px ${colors?.gray[200]};
    `;
  }}
`;

export const PrivateContent = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 20px;
`;

export const StyledLockIconWrapper = styled.div`
  ${rightMarginXxs}
`;

export const StyledCallout = styled(Callout)`
  background-color: rgba(0, 0, 0, 0);
  max-width: 80%;
  
  ${(props: CommonThemeProps) => {
    const colors = getColors(props);

    return `
      color: ${colors?.error[600]}
    `;
  }}
`