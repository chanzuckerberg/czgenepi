import styled from "@emotion/styled";
import TextField from "@material-ui/core/TextField";
import { getSpaces, Props } from "czifui";

export const StyledTextField = styled(TextField)`
  ${(props: Props) => {
    const spacings = getSpaces(props);

    return `
      width: ${(spacings?.l || 0) + 200}px;
      padding-right: ${spacings?.l}px;
      margin: 0;
    `;
  }}
`;
