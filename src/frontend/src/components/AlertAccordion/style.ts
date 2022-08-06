import styled from "@emotion/styled";
import { Collapse } from "@mui/material";
import { Callout, getSpaces } from "czifui";
import { transparentScrollbars } from "src/common/styles/basicStyle";

export const RowFlexContainer = styled.div`
  display: flex;
  height: 100%;

  .MuiCollapse-root {
    overflow-y: auto;
  }

  svg {
    fill: black;
  }
`;

export const ColumnFlexContainer = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1 1 auto;
  .MuiCollapse-root {
    ${transparentScrollbars}
  }
`;

export const StaticSizeDiv = styled.div`
  flex: 0 0 auto;
`;

export const StyledCallout = styled(Callout)`
  max-height: 250px;
  width: 100%;

  .MuiAlert-message {
    width: 100%;
  }
`;

export const StyledCollapse = styled(Collapse)`
  ${(props) => {
    const spaces = getSpaces(props);
    return `
      .MuiCollapse-wrapper {
        margin-top: ${spaces?.xs}px;
      }
    `;
  }}
`;
