import styled from "@emotion/styled";
import { Button, DialogTitle, fontBodyS, getSpaces } from "czifui";
import { H2 } from "src/common/styles/basicStyle";

export const Content = styled.p`
  ${fontBodyS}
  ${(props) => {
    const spaces = getSpaces(props);
    return `
      margin-bottom: ${spaces?.xl}px;
    `;
  }}
`;

export const Header = styled(H2)`
  display: unset;
`;

export const StyledDialogTitle = styled(DialogTitle)`
  ${(props) => {
    const spaces = getSpaces(props);
    return `
      margin-bottom: ${spaces?.l}px;
    `;
  }}
`;

export const StyledButton = styled(Button)`
  ${(props) => {
    const spaces = getSpaces(props);
    return `
      margin-right: ${spaces?.s}px;
    `;
  }}
`;
