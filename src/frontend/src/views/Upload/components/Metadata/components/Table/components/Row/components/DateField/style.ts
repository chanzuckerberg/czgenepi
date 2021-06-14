import styled from "@emotion/styled";
import TextField from "@material-ui/core/TextField";
import { getSpacings } from "czifui";

export const StyledTextField = styled(TextField)`
  ${(props) => {
    const spacings = getSpacings(props);

    return `
      min-width: ${(spacings?.l || 0) + 120}px;
      padding-right: ${spacings?.l}px;
      margin: 0;
    `;
  }}
`;
