import styled from "@emotion/styled";
import { getColors, TableRow } from "czifui";

export const StyledTableRow = styled(TableRow)`
  ${(props) => {
    const colors = getColors(props);
    return `
      &:hover {
        background-color: ${colors?.primary[100]};
      }
    `;
  }}
`;
