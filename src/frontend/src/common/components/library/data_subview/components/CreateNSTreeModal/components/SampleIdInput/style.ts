import styled from "@emotion/styled";
import { TextField } from "@material-ui/core";
import { getColors, getIconSizes, getSpaces } from "czifui";
import LoadingAnimation from "src/common/icons/IconLoadingAnimated.svg";

export const StyledTextArea = styled(TextField)`
  textarea {
    color: black;
    resize: both;
  }
`;

export const StyledLabel = styled.div`
  display: flex;
  align-items: center;
`;

export const StyledLoadingAnimation = styled(LoadingAnimation)`
  ${(props) => {
    const colors = getColors(props);
    const iconSizes = getIconSizes(props);
    const spaces = getSpaces(props);

    return `
      path {
        fill: ${colors?.gray[400]};
      }
      height: ${iconSizes?.l.height}px;
      width: ${iconSizes?.l.width}px;
      margin-right: ${spaces?.m}px;
    `;
  }}
`;
