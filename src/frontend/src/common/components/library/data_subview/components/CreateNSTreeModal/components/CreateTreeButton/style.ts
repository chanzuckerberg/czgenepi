import styled from "@emotion/styled";
import { Button, getColors, getSpaces } from "czifui";

export const StyledButton = styled(Button)`
  ${(props) => {
    const spaces = getSpaces(props);
    const colors = getColors(props);
    return `
      margin-top: ${spaces?.xxl}px;

      &:active {
        background-color: ${colors?.gray[400]};
      }
    `;
  }}
`;

export const StyledButtonWrapper = styled.div`
  width: fit-content;
`;
