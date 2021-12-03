import styled from "@emotion/styled";
import { Button, fontHeaderXl, getColors } from "czifui";

export const StyledSpan = styled.span`
  ${fontHeaderXl}
`;

export const StyledButton = styled(Button)`
  ${(props) => {
    const colors = getColors(props);

    return `
      background-color: ${colors?.error[400]};

      &:hover,
      &:active {
        background-color: ${colors?.error[600]};
      }
    `;
  }}
`;
