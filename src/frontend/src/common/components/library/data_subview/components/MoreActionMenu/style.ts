import styled from "@emotion/styled";
import { getColors, getIconSizes, getSpaces, Props } from "czifui";
import MoreActionsIcon from "src/common/icons/IconDotsHorizontal3Large.svg";
import TrashIcon from "src/common/icons/IconTrashCanSmall.svg";

interface ExtraProps extends Props {
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

export const StyledText = styled.span`
  ${(props) => {
    const colors = getColors(props);

    return `
      color: ${colors?.error[600]};
    `;
  }}
`;

export const StyledTrashIcon = styled(TrashIcon)`
  ${(props) => {
    const colors = getColors(props);
    const iconSizes = getIconSizes(props);
    const spaces = getSpaces(props);

    return `
      fill: ${colors?.error[400]};
      height: ${iconSizes?.xs.height}px;
      width: ${iconSizes?.xs.width}px;
      margin-right: ${spaces?.m}px;
    `;
  }}
`;
