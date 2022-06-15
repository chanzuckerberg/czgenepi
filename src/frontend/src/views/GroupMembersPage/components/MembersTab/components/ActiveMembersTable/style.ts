import styled from "@emotion/styled";
import { StyledCell } from "src/common/components/library/Table/components/Cell/style";
import {
  StyledHeader,
  StyledRow,
} from "src/common/components/library/Table/components/Row/style";

export const Capitalized = styled.span`
  text-transform: capitalize;
`;

// (mlila): This wrapper can be removed when we add more columns to this table again
// for example, role and date added columns
export const Wrapper = styled.div`
  ${StyledHeader},
  ${StyledRow} {
    justify-content: space-evenly;

    ${StyledCell} {
      flex: unset;
    }
  }
`;
