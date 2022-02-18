// includes shared styles for icons
import styled from "@emotion/styled";
import { Button, getColors, getIconSizes, getSpaces } from "czifui";
import EditIcon from "src/common/icons/IconEditSmall.svg";
import TrashIcon from "src/common/icons/IconTrashCanSmall.svg";

export const IconButtonBubble = styled(Button)`
  border-radius: 50%;
  flex: 0 0 0;
  min-width: unset;

  ${(props) => {
    const colors = getColors(props);
    const spaces = getSpaces(props);
    return `
    fill: ${colors?.gray[300]};
    margin: ${spaces?.xxxs}px;
    padding: ${spaces?.xs}px;
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
