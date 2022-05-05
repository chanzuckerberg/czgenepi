import styled from "@emotion/styled";
import { InputDropdown } from "czifui";
import { DateFilterMenu } from "src/components/DateFilterMenu";

export const StyledInputDropdown = styled(InputDropdown)`
  width: 224px;
  span {
    color: black;
  }
`;

export const StyledDateFilterMenu = styled(DateFilterMenu)`
  max-height: 290px;
  min-width: 270px;
`;
