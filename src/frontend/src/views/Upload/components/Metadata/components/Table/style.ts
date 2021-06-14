import styled from "@emotion/styled";
import { TableCell, TableContainer, TableRow } from "@material-ui/core";
import { fontBodyM, fontHeaderXs, getColors, getSpacings } from "czifui";

export const Overflow = styled.div`
  overflow: auto;

  ${(props) => {
    const spacings = getSpacings(props);

    return `
      padding-bottom: ${spacings?.m}px;
      margin-bottom: ${spacings?.xxl}px;
    `;
  }}
`;

export const StyledTableContainer = styled(TableContainer)`
  max-height: 450px;
`;

export const IdColumn = styled.div`
  ${(props) => {
    const spacings = getSpacings(props);

    return `
      padding-left: ${spacings?.s}px;
    `;
  }}
`;

export const StyledTableCell = styled(TableCell)`
  ${fontHeaderXs}

  ${(props) => {
    const colors = getColors(props);
    const spacings = getSpacings(props);

    return `
      color: ${colors?.gray[500]};
      padding: ${spacings?.l}px ${spacings?.l}px ${spacings?.l}px 0;
      border-bottom: solid 2px ${colors?.gray[200]};
    `;
  }}
`;

export const IsPrivateTableCell = styled(StyledTableCell)`
  ${(props) => {
    const colors = getColors(props);
    const spacings = getSpacings(props);

    return `
      padding: ${spacings?.l}px 0;
      border-left: solid 2px ${colors?.gray[200]};
      border-right: solid 2px ${colors?.gray[200]};
    `;
  }}
`;

export const SubmittedToGisaidTableCell = styled(StyledTableCell)`
  ${(props) => {
    const spacings = getSpacings(props);

    return `
      padding: ${spacings?.l}px;
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
