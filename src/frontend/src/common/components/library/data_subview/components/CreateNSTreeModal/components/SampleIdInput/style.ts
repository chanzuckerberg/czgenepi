import styled from "@emotion/styled";
import { TextField } from "@material-ui/core";
import {
  Button,
  CommonThemeProps,
  fontBodyXs,
  getColors,
  getCorners,
  getSpaces,
} from "czifui";
import { transparentScrollbars } from "src/common/styles/basicStyle";
import { iconFillGray } from "src/common/styles/iconStyle";

const inputPadding = (props: CommonThemeProps) => {
  const spaces = getSpaces(props);
  return `
    .MuiInputBase-root {
      padding: ${spaces?.s}px ${spaces?.l}px;
    }
  `;
};

interface ExtraProps extends CommonThemeProps {
  disabled?: boolean;
}

export const StyledTextArea = styled(TextField)`
  ${inputPadding}

  .MuiInputBase-root {
    min-height: 70px;
  }

  textarea {
    ${fontBodyXs}
    ${transparentScrollbars}
    resize: vertical;
  }

  ${(props: ExtraProps) => {
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

        fieldset {
          border: none;
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

export const BaselineFlexContainer = styled.div`
  display: flex;
  align-items: baseline;
`;

export const StyledLoadingSpinnerWrapper = styled.div`
  ${iconFillGray}
  ${(props) => {
    const spaces = getSpaces(props);

    return `
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
