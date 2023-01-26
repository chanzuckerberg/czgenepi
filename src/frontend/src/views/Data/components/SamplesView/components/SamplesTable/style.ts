import styled from "@emotion/styled";
import {
  CellBasic,
  getColors,
  getFontWeights,
  getSpaces,
  InputCheckbox,
  TableRow,
} from "czifui";

export const StyledPrivateId = styled(CellBasic)`
  padding-left: 0;

  ${(props) => {
    const fontWeights = getFontWeights(props);
    return `
      span:first-of-type {
        font-weight: ${fontWeights?.semibold};
        word-break: break-all;
      }
    `;
  }}
`;

export const StyledCellBasic = styled(CellBasic)`
  ${(props) => {
    const fontWeights = getFontWeights(props);
    return `
      span {
        font-weight: ${fontWeights?.semibold};
        word-break: break-word;
      }
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

export const StyledInputCheckbox = styled(InputCheckbox)`
  ${(props) => {
    const spaces = getSpaces(props);
    return `
      padding-bottom: ${spaces?.xxs}px;
    `;
  }}
`;

// needed to keep search bar sticky
export const StyledWrapper = styled.div`
  flex: 1 1 auto;
  overflow-y: auto;

  & > div {
    overflow: auto;
  }
`;
