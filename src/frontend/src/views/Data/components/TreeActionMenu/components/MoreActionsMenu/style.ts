import styled from "@emotion/styled";
import { getColors, getIconSizes, getSpaces } from "czifui";
import TrashIcon from "src/common/icons/IconTrashCanSmall.svg";

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
