// TODO_TR (mlila): delete this file after table refactor complete
import styled from "@emotion/styled";
import {
  iconFillBlack,
  iconFillError,
  rightMarginM,
} from "src/common/styles/iconStyle";

export const StyledTrashIconWrapper = styled.div`
  ${rightMarginM}
  ${iconFillError}
`;

export const StyledEditIconWrapper = styled.div`
  ${iconFillBlack}
  ${rightMarginM}
`;
