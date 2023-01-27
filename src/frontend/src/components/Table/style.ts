import styled from "@emotion/styled";
import { getColors, getSpaces, InputCheckbox, TableRow } from "czifui";

// needed to keep search bar sticky
export const StyledWrapper = styled.div`
  flex: 1 1 auto;
  overflow-y: auto;

  & > div {
    overflow: auto;
  }
`;

export const StyledInputCheckbox = styled(InputCheckbox)`
  ${(props) => {
    const spaces = getSpaces(props);
    return `
      padding-bottom: ${spaces?.xxs}px;
    `;
  }}
`;

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
