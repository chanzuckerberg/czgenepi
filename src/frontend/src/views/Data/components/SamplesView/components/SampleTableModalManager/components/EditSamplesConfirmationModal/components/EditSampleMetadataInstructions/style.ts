import styled from "@emotion/styled";
import { Button, fontBodyXxs, getColors, getSpaces } from "czifui";

export const StyledButton = styled(Button)`
  ${fontBodyXxs}
  ${(props) => {
    const colors = getColors(props);
    const spaces = getSpaces(props);
    return `
      padding-bottom: ${spaces?.s}px;
      color: ${colors?.primary[500]};
      &:hover {
        background-color: transparent;
      }
    `;
  }}
`;
