import styled from "@emotion/styled";
import { Callout, CommonThemeProps, getSpaces } from "czifui";

export const StyledCallout = styled(Callout)`
  ${(props: CommonThemeProps) => {
    const spaces = getSpaces(props);
    return `
      margin-top: ${spaces?.l}px;
      max-width: 100%;
    `;
  }}
`;
