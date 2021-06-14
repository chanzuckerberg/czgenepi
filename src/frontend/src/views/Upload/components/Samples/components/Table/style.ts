import styled from "@emotion/styled";
import { TableCell, TableContainer, TableHead } from "@material-ui/core";
import { fontBodyXs, fontHeaderXs, getColors, getSpacings } from "czifui";

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

export const StyledTableCell = styled(TableCell)`
  ${fontBodyXs}
  ${(props) => {
    const colors = getColors(props);
    const spacings = getSpacings(props);
    return `
      padding: ${spacings?.m}px 0;
      border-bottom: solid 1px ${colors?.gray[200]};
    `;
  }}
`;

export const StyledHeaderTableCell = styled(TableCell)`
  ${fontHeaderXs}
  ${(props) => {
    const spacings = getSpacings(props);
    const colors = getColors(props);
    return `
      padding: ${spacings?.m}px 0;
      color: ${colors?.gray[400]};
      border-bottom: solid 2px ${colors?.gray[200]};
      
    `;
  }}
`;

export const StyledTableHead = styled(TableHead)`
  ${fontHeaderXs}
  ${(props) => {
    const spacings = getSpacings(props);
    return `
      padding: ${spacings?.m}px 0;
    `;
  }}
`;
