import styled from "@emotion/styled";
import { Button, getColors } from "czifui";

export const StyledButton = styled(Button)`
  margin-top: 0;

  ${(props) => {
    const colors = getColors(props);
    return `
      &:active {
        background-color: ${colors?.gray[400]};
      }
    `;
  }}
`;

export const StyledButtonWrapper = styled.div`
  width: fit-content;
`;
