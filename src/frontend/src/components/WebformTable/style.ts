import styled from "@emotion/styled";
import { TableCell, TableContainer, TableRow } from "@mui/material";
import { fontBodyM, fontHeaderXs, getColors, getSpaces } from "czifui";

export const Overflow = styled.div`
  overflow: auto;

  ${(props) => {
    const spaces = getSpaces(props);

    return `
      padding-bottom: ${spaces?.m}px;
      margin-bottom: ${spaces?.xxl}px;
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
      padding: ${spaces?.l}px ${spaces?.l}px ${spaces?.l}px 0;
      border-bottom: solid 2px ${colors?.gray[200]};
    `;
  }}
`;

export const IsPrivateTableCell = styled(StyledTableCell)`
  ${(props) => {
    const colors = getColors(props);
    const spaces = getSpaces(props);

    return `
      min-width: 100px;
      padding: ${spaces?.l}px ${spaces?.l}px;
      border-left: solid 2px ${colors?.gray[200]};
    `;
  }}
`;

export const StyledTableRow = styled(TableRow)`
  .MuiTableCell-stickyHeader {
    background-color: white;
  }
`;

export const LoadingMessage = styled.div`
  ${fontBodyM}
`;
