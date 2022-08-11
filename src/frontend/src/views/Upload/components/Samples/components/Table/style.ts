import styled from "@emotion/styled";
import { TableCell, TableContainer, TableHead } from "@mui/material";
import {
  CommonThemeProps,
  fontBodyM,
  fontBodyXs,
  fontHeaderXs,
  getColors,
  getSpaces,
} from "czifui";

export const Overflow = styled.div`
  overflow: auto;
  ${(props: CommonThemeProps) => {
    const spaces = getSpaces(props);
    return `
      padding-bottom: ${spaces?.m}px;
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
    const spaces = getSpaces(props);
    return `
      padding: ${spaces?.m}px 0;
      border-bottom: solid 1px ${colors?.gray[200]};
      margin-right: ${spaces?.m}px;
    `;
  }}
`;

export const StyledHeaderTableCell = styled(TableCell)`
  ${fontHeaderXs}
  ${(props) => {
    const spaces = getSpaces(props);
    const colors = getColors(props);
    return `
      padding: ${spaces?.m}px 0;
      color: ${colors?.gray[400]};
      border-bottom: solid 2px ${colors?.gray[200]};

    `;
  }}
`;

export const StyledTableHead = styled(TableHead)`
  ${fontHeaderXs}
  ${(props) => {
    const spaces = getSpaces(props);
    return `
      padding: ${spaces?.m}px 0;
    `;
  }}
`;

export const LoadingMessage = styled.div`
  ${fontBodyM}
`;
