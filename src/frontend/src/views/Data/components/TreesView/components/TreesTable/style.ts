import styled from "@emotion/styled";
import { CellBasic, getFontWeights } from "czifui";
import { SortableHeader } from "src/views/Data/components/SortableHeader";

export const StyledSortableHeader = styled(SortableHeader)`
  width: "auto";
`;

export const StyledWrapper = styled.div`
  /* needed to keep search bar sticky */
  flex: 1 1 auto;
  overflow-y: auto;

  & > div {
    overflow: auto;
  }
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
