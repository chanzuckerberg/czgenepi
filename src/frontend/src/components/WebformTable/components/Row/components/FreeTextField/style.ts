import styled from "@emotion/styled";
import TextField from "@mui/material/TextField";
import { getColors, getSpaces } from "czifui";
import {
  doNotForwardProps,
  FormFieldProps,
} from "src/components/DateField/style";

export const StyledTextField = styled(TextField, {
  shouldForwardProp: (prop) => !doNotForwardProps.includes(prop as string),
})`
  ${(props: FormFieldProps) => {
    const { isBackgroundColorShown } = props;
    const spaces = getSpaces(props);
    const colors = getColors(props);

    return `
      width: ${(spaces?.l || 0) + 200}px;
      padding-right: ${spaces?.l}px;
      margin: 0;
      input {
        background-color: ${isBackgroundColorShown && colors?.primary[200]};
      }
    `;
  }}
`;
