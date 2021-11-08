import styled from "@emotion/styled";
import { TextField } from "@material-ui/core";
import {
  fontBodyXs,
  getColors,
  getCorners,
  getIconSizes,
  getSpaces,
} from "czifui";
import LoadingAnimation from "src/common/icons/IconLoadingAnimated.svg";

const inputPadding = (props) => {
  const spaces = getSpaces(props);
  return `
    .MuiInputBase-root {
      padding: ${spaces?.s}px ${spaces?.l}px;
    }
  `;
};

export const StyledTextArea = styled(TextField)`
  // TODO (mlila): input doesn't displace button
  ${fontBodyXs}
  ${inputPadding}
  height: 70px;

  textarea {
    resize: both;
  }
`;

export const DisabledStyledTextArea = styled(TextField)`
  ${fontBodyXs}
  ${inputPadding}
  height: 90px;

  ${(props) => {
    const colors = getColors(props);
    const corners = getCorners(props);

    return `
      background-color: ${colors?.gray[100]};
      border-radius: ${corners?.m}px;
      margin: ${spaces?.xxxs}px 0;
    `;
  }}
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
