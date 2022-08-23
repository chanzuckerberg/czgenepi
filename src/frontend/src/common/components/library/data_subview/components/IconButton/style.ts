import styled from "@emotion/styled";
import { CommonThemeProps, getSpaces } from "czifui";

export const StyledSpan = styled.span`
  display: flex;
  ${(props: CommonThemeProps) => {
    const spaces = getSpaces(props);
    return `
      margin-left: ${spaces?.m}px;
    `;
  }}
`;
