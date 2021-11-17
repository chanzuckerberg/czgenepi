import styled from "@emotion/styled";
import { fontBodyXs, getIconSizes, getSpaces, Props } from "czifui";
import ArrowDownIcon from "src/common/icons/IconArrowDownSmall.svg";
import ArrowUpIcon from "src/common/icons/IconArrowUpSmall.svg";
import { transparentScrollbars } from "src/common/styles/support/style";
import { StyledCallout as Callout } from "../../../FailedSampleAlert/style";

const smallIcon = (props: Props) => {
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

export const StyledList = styled.ul`
  padding: 0;

  /* TODO (mlila): this should be exported from SDS */
  li:nth-of-type(odd) {
    background-color: #f4eee4;
  }
`;

export const StyledListItem = styled.li`
  ${fontBodyXs}
  list-style-type: none;

  ${(props) => {
    const spaces = getSpaces(props);

    return `
      padding: ${spaces?.m}px;
    `;
  }}
`;

export const StyledCallout = styled(Callout)`
  max-height: 250px;
  .MuiAlert-message {
    width: 100%;
  }
`;
