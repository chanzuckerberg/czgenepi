import styled from "@emotion/styled";
import { InputDropdown } from "czifui";
import { DateFilterMenu } from "src/components/DateFilterMenu";
import { DROPDOWN_WIDTH } from "../../style";

export const StyledInputDropdown = styled(InputDropdown)`
  width: ${DROPDOWN_WIDTH};
  span {
    color: black;
  }
`;

export const StyledDateFilterMenu = styled(DateFilterMenu)`
  max-height: 290px;
  min-width: 270px;
`;
