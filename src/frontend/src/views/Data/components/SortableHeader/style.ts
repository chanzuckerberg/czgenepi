import styled from "@emotion/styled";
import { CellHeader } from "czifui";

export const StyledCellHeader = styled(CellHeader)`
  span {
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;
  }
`;
