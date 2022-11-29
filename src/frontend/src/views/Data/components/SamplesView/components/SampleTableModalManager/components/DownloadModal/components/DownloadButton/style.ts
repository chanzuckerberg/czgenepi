import styled from "@emotion/styled";
import { Button, CommonThemeProps, getSpaces } from "czifui";

export const StyledButton = styled(Button)`
  max-width: fit-content;

  ${(props: CommonThemeProps) => {
    const spaces = getSpaces(props);
    return `
      margin-top: ${spaces?.xxl}px;
    `;
  }}
`;
