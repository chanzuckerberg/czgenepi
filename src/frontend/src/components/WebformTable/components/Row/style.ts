import styled from "@emotion/styled";
import {
  TableCell,
  TableRow,
  TableRowProps as MuiTableRowProps,
} from "@mui/material";
import { CommonThemeProps, fontHeaderS, getColors, getSpaces } from "czifui";

export const Id = styled.div`
  ${fontHeaderS}

  min-width: 300px;

  justify-content: center;
  display: flex;
  flex-direction: column;

  ${(props) => {
    const spaces = getSpaces(props);

    return `
      padding: ${spaces?.m}px 0 ${spaces?.m}px ${spaces?.s}px
    `;
  }}
`;

interface TableRowProps extends MuiTableRowProps, CommonThemeProps {
  component: "div";
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
  ${(props: CommonThemeProps) => {
    const spaces = getSpaces(props);

    return `
      padding: ${spaces?.m}px 0;
    `;
  }}
`;

export const IsPrivateTableCell = styled(TableCell)`
  ${(props: CommonThemeProps) => {
    const spaces = getSpaces(props);
    const colors = getColors(props);

    return `
      padding: ${spaces?.m}px 0;
      border-left: solid 2px ${colors?.gray[200]};
    `;
  }}
`;

export const StyledDiv = styled.div`
  ${(props: CommonThemeProps) => {
    const spaces = getSpaces(props);

    return `
      padding-right: ${spaces?.l}px;
    `;
  }}
`;
