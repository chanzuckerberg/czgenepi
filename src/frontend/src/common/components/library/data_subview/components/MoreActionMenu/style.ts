import styled from "@emotion/styled";
import { CommonThemeProps, getColors, getIconSizes } from "czifui";
import MoreActionsIcon from "src/common/icons/IconDotsHorizontal3Large.svg";

interface ExtraProps extends CommonThemeProps {
  disabled?: boolean;
}

const doNotForwardProps = ["disabled"];

export const StyledMoreActionsIcon = styled(MoreActionsIcon, {
  shouldForwardProp: (prop) => !doNotForwardProps.includes(prop as string),
})`
  ${(props: ExtraProps) => {
    const { disabled } = props;
    const colors = getColors(props);
    const iconSizes = getIconSizes(props);

    return `
      fill: ${disabled ? colors?.gray[300] : colors?.primary[400]};
      height: ${iconSizes?.xl.height}px;
      width: ${iconSizes?.xl.width}px;
    `;
  }}
`;
