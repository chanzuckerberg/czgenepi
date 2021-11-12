import styled from "@emotion/styled";
import { getIconSizes, Props } from "czifui";
import ArrowDownIcon from "src/common/icons/IconArrowDownSmall.svg";
import ArrowUpIcon from "src/common/icons/IconArrowUpSmall.svg";

const smallIcon = (props: Props) => {
  const iconSizes = getIconSizes(props);
  return `
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
