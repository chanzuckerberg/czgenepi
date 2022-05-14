import styled from "@emotion/styled";
import { getColors, getIconSizes } from "czifui";
import LoadingSpinner from "src/common/icons/IconLoadingAnimated.svg";

export const StyledLoadingSpinner = styled(LoadingSpinner)`
  ${(props) => {
    const colors = getColors(props);
    const iconSizes = getIconSizes(props);

    return `
      path {
        fill: ${colors?.gray[400]};
      }
      height: ${iconSizes?.l.height}px;
      width: ${iconSizes?.l.width}px;
    `;
  }}
`;
