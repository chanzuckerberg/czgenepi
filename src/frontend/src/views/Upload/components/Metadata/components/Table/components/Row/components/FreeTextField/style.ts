import styled from "@emotion/styled";
import TextField from "@material-ui/core/TextField";
import { getSpaces, Props } from "czifui";

export const StyledTextField = styled(TextField)`
  ${(props: Props) => {
    const spaces = getSpaces(props);

    return `
      width: ${(spaces?.l || 0) + 200}px;
      padding-right: ${spaces?.l}px;
      margin: 0;
    `;
  }}
`;
