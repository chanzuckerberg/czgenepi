import styled from "@emotion/styled";
import { getSpaces } from "czifui";
import { ZebraStripes } from "src/common/styles/mixins/global";

export const StyledDiv = styled.div`
  ${ZebraStripes}

  ${(props) => {
    const spaces = getSpaces(props);
    return `
      padding: ${spaces?.l}px;
    `;
  }}
`;
