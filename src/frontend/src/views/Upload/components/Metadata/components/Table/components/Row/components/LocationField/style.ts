import styled from "@emotion/styled";
import TextField from "@material-ui/core/TextField";
import { fontBodyXxs, getColors, getSpaces } from "czifui";

export const StyledTextField = styled(TextField)`
  ${(props) => {
    const spaces = getSpaces(props);

    return `
      min-width: ${(spaces?.l || 0) + 195}px;
      padding-right: ${spaces?.l}px;
      margin: 0;
    `;
  }}
`;

export const StyledDiv = styled.div`
  ${(props) => {
    const spaces = getSpaces(props);

    return `
      padding-right: ${spaces?.l}px;
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
