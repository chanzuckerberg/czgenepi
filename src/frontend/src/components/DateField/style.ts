import styled from "@emotion/styled";
import TextField from "@mui/material/TextField";
import { CommonThemeProps, getColors, getSpaces } from "czifui";

export interface FormFieldProps extends CommonThemeProps {
  isBackgroundColorShown: boolean | undefined;
}

export const doNotForwardProps = ["isBackgroundColorShown"];

export const StyledTextField = styled(TextField, {
  shouldForwardProp: (prop) => !doNotForwardProps.includes(prop as string),
})`
  ${(props: FormFieldProps) => {
    const spaces = getSpaces(props);
    const colors = getColors(props);
    const { isBackgroundColorShown } = props;
    return `
      width: ${(spaces?.l || 0) + 120}px;
      margin: 0;
      input {
        background-color: ${isBackgroundColorShown && colors?.primary[200]};
        padding: ${spaces?.s}px ${spaces?.l}px;
      }
    `;
  }}
`;
