import styled from "@emotion/styled";
import TextField from "@material-ui/core/TextField";
import { CommonThemeProps, getSpaces } from "czifui";

export const StyledTextField = styled(TextField)`
  ${(props: CommonThemeProps) => {
    const spaces = getSpaces(props);

    return `
      width: ${(spaces?.l || 0) + 200}px;
      padding-right: ${spaces?.l}px;
      margin: 0;
    `;
  }}
`;
