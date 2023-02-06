import styled from "@emotion/styled";
import { getSpaces, InputCheckbox } from "czifui";

export const StyledInputCheckbox = styled(InputCheckbox)`
  ${(props) => {
    const spaces = getSpaces(props);
    return `
      padding-bottom: ${spaces?.xxs}px;
    `;
  }}
`;
