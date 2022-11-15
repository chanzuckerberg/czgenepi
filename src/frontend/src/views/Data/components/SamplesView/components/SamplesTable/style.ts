import styled from "@emotion/styled";
import { CellBasic, getFontWeights } from "czifui";

export const StyledPrivateId = styled(CellBasic)`
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
