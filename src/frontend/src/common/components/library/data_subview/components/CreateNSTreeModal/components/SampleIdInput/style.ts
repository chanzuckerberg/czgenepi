import styled from "@emotion/styled";
import { TextField } from "@material-ui/core";
import {
  Button,
  fontBodyXs,
  getColors,
  getCorners,
  getIconSizes,
  getSpaces,
  Props,
} from "czifui";
import LoadingAnimation from "src/common/icons/IconLoadingAnimated.svg";

const inputPadding = (props: Props) => {
  const spaces = getSpaces(props);
  return `
    .MuiInputBase-root {
      padding: ${spaces?.s}px ${spaces?.l}px;
    }
  `;
};

export const StyledTextArea = styled(TextField)`
  ${inputPadding}

  .MuiInputBase-root {
    min-height: 70px;
  }

  textarea {
    ${fontBodyXs}
    resize: both;
  }

  ${(props: Props) => {
    const { disabled } = props;

    if (disabled) {
      const colors = getColors(props);
      const corners = getCorners(props);
      const spaces = getSpaces(props);

      return `
        background-color: ${colors?.gray[100]};
        border-radius: ${corners?.m}px;
        margin: ${spaces?.xxxs}px 0;

        .MuiInputBase-root {
          height: 90px;
        }

        textarea {
          color: black;
          resize: none;
        }
      `;
    }
  }}
`;

export const FlexContainer = styled.div`
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

export const StyledAddButton = styled(Button)`
  ${(props) => {
    const spaces = getSpaces(props);
    return `
      margin-top: ${spaces?.m}px;
    `;
  }}
`;

export const StyledEditButton = styled(Button)`
  padding: 0;
  min-width: 0;

  span {
    margin: 0;
  }
`;

export const StyledSampleCount = styled.span`
  ${fontBodyXs}
  ${(props) => {
    const colors = getColors(props);
    const spaces = getSpaces(props);

    return `
      color: ${colors?.gray[500]};
      margin-right: ${spaces?.m}px;
    `;
  }}
`;
