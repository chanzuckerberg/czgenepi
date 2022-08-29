import styled from "@emotion/styled";
import {
  Button,
  CommonThemeProps,
  fontHeaderXl,
  getColors,
  getSpaces,
} from "czifui";

export const StyledSpan = styled.span`
  ${fontHeaderXl}
`;

export const StyledButton = styled(Button)`
  ${(props: CommonThemeProps) => {
    const colors = getColors(props);
    const spaces = getSpaces(props);

    return `
      background-color: ${colors?.error[400]};
      margin-right: ${spaces?.xxxs}px;

      &:hover,
      &:active {
        background-color: ${colors?.error[600]};
      }
    `;
  }}
`;
