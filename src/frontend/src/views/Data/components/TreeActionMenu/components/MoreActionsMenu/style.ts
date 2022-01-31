import styled from "@emotion/styled";
import { getColors, getIconSizes, getSpaces, Props } from "czifui";
import EditIcon from "src/common/icons/IconEditSmall.svg";
import TrashIcon from "src/common/icons/IconTrashCanSmall.svg";

interface ExtraProps extends Props {
  isRed?: boolean;
}

const doNotForwardProps = ["isRed"];

export const StyledText = styled("span", {
  shouldForwardProp: (prop) => !doNotForwardProps.includes(prop as string),
})`
  ${(props: ExtraProps) => {
    const { isRed } = props;
    const colors = getColors(props);

    return `
      color: ${isRed ? colors?.error[600] : "black"};
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

export const StyledEditIcon = styled(EditIcon)`
  fill: black;
  ${(props) => {
    const iconSizes = getIconSizes(props);
    const spaces = getSpaces(props);
    return `
      height: ${iconSizes?.xs.height}px;
      width: ${iconSizes?.xs.width}px;
      margin-right: ${spaces?.m}px;
    `;
  }}
`;
