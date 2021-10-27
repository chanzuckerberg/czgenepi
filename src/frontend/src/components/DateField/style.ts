import styled from "@emotion/styled";
import TextField from "@material-ui/core/TextField";
import { getSpaces } from "czifui";

export const StyledTextField = styled(TextField)`
  ${(props) => {
    const spaces = getSpaces(props);

    return `
      width: ${(spaces?.l || 0) + 120}px;
      margin: 0;
    `;
  }}
`;
