import styled from "@emotion/styled";
import {
  TableCell,
  TableRow,
  TableRowProps as MuiTableRowProps,
} from "@material-ui/core";
import { Lock } from "@material-ui/icons";
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

export const IsPrivateContent = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 20px;
`;

export const StyledLock = styled(Lock)`
  ${(props) => {
    const spacings = getSpacings(props);

    return `
      margin-right: ${spacings?.xs}px;
    `;
  }}
`;
