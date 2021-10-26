import styled from "@emotion/styled";
import TextField from "@material-ui/core/TextField";
import { getSpaces } from "czifui";

export const StyledTextField = styled(TextField)`
  ${(props) => {
    const spacings = getSpaces(props);

    return `
      width: ${(spacings?.l || 0) + 120}px;
      margin: 0;
    `;
  }}
`;
