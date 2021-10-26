import styled from "@emotion/styled";
import TextField from "@material-ui/core/TextField";
import { fontBodyXxs, getColors, getSpaces } from "czifui";

export const StyledTextField = styled(TextField)`
  ${(props) => {
    const spacings = getSpaces(props);

    return `
      min-width: ${(spacings?.l || 0) + 195}px;
      padding-right: ${spacings?.l}px;
      margin: 0;
    `;
  }}
`;

export const MenuSubtext = styled.div`
  ${fontBodyXxs}

  ${(props) => {
    const colors = getColors(props);

    return `
      color: ${colors?.gray[500]};
    `;
  }}
`;
