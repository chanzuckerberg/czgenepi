import styled from "@emotion/styled";
import { Button, CommonThemeProps, fontBodyXxs, getFontWeights, getSpaces } from "czifui";

export const StyledButton = styled(Button)`
  ${fontBodyXxs}
  color: black;
  &:hover {
    background-color: transparent;
  }
  ${(props: CommonThemeProps) => {
    const spaces = getSpaces(props);
    const fontWeights = getFontWeights(props);
    return `
      font-weight: ${fontWeights?.semibold};
      margin-top: ${spaces?.xs}px;
      margin-left: 0px;
      padding-left: 0px;
    `;
  }}
`;
