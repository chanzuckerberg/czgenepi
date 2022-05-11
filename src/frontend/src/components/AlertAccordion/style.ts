import styled from "@emotion/styled";
import { Collapse } from "@material-ui/core";
import { Callout, CommonThemeProps, getIconSizes, getSpaces } from "czifui";
import ArrowDownIcon from "src/common/icons/IconArrowDownSmall.svg";
import ArrowUpIcon from "src/common/icons/IconArrowUpSmall.svg";
import { transparentScrollbars } from "src/common/styles/basicStyle";

const smallIcon = (props: CommonThemeProps) => {
  const iconSizes = getIconSizes(props);
  return `
    flex: 0 0 auto;
    height: ${iconSizes?.s.height}px;
    width: ${iconSizes?.s.width}px;
  `;
};

export const StyledArrowDownIcon = styled(ArrowDownIcon)`
  ${smallIcon}
`;

export const StyledArrowUpIcon = styled(ArrowUpIcon)`
  ${smallIcon}
`;

export const RowFlexContainer = styled.div`
  display: flex;
  height: 100%;

  .MuiCollapse-root {
    overflow-y: auto;
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
