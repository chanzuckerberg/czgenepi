import styled from "@emotion/styled";
import { TableCell, TableContainer, TableRow } from "@material-ui/core";
import { fontHeaderXs, getColors, getSpaces } from "czifui";

export const Overflow = styled.div`
  overflow: auto;

  ${(props) => {
    const spaces = getSpaces(props);

    return `
      margin-bottom: ${spaces?.l}px;
    `;
  }}
`;

export const StyledTableContainer = styled(TableContainer)`
  max-height: 450px;
`;

export const IdColumn = styled.div`
  ${(props) => {
    const spaces = getSpaces(props);

    return `
      padding-left: ${spaces?.s}px;
    `;
  }}
`;

export const StyledTableCell = styled(TableCell)`
  ${fontHeaderXs}

  ${(props) => {
    const colors = getColors(props);
    const spaces = getSpaces(props);

    return `
      color: ${colors?.gray[500]};
      padding: ${spaces?.m}px;
      border-bottom: solid 2px ${colors?.gray[200]};
    `;
  }}
`;

export const IsPrivateTableCell = styled(StyledTableCell)`
  ${(props) => {
    const colors = getColors(props);
    const spaces = getSpaces(props);

    return `
      padding: ${spaces?.l}px 0;
      border-left: solid 2px ${colors?.gray[200]};
      border-right: solid 2px ${colors?.gray[200]};
    `;
  }}
`;

export const StyledTableRow = styled(TableRow)`
  .MuiTableCell-stickyHeader {
    background-color: white;
  }
`;
