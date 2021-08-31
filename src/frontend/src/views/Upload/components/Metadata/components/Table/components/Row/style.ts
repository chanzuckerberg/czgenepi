import styled from "@emotion/styled";
import {
  TableCell,
  TableRow,
  TableRowProps as MuiTableRowProps,
} from "@material-ui/core";
import {
  fontHeaderS,
  getColors,
  getSpacings,
  Props as CzifuiProps,
} from "czifui";

export const Id = styled.div`
  ${fontHeaderS}

  min-width: 300px;

  justify-content: center;
  display: flex;
  flex-direction: column;

  ${(props) => {
    const spacings = getSpacings(props);

    return `
      padding: ${spacings?.m}px 0 ${spacings?.m}px ${spacings?.s}px
    `;
  }}
`;

interface TableRowProps extends MuiTableRowProps, CzifuiProps {
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
  ${(props) => {
    const spacings = getSpacings(props);

    return `
      padding: ${spacings?.m}px 0;
    `;
  }}
`;

export const IsPrivateTableCell = styled(TableCell)`
  ${(props) => {
    const spacings = getSpacings(props);
    const colors = getColors(props);

    return `
      padding: ${spacings?.m}px 0;
      border-left: solid 2px ${colors?.gray[200]};
      border-right: solid 2px ${colors?.gray[200]};
    `;
  }}
`;

export const StyledDiv = styled.div`
  ${(props) => {
    const spacings = getSpacings(props);

    return `
      padding-right: ${spacings?.l}px;
    `;
  }}
`;
