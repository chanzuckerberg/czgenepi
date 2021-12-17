import styled from "@emotion/styled";
import { Callout, getSpaces } from "czifui";

export const StyledCallout = styled(Callout)`
  ${(props) => {
    const spaces = getSpaces(props);
    return `
      margin-top: ${spaces?.l}px;
      max-width: 100%;
    `;
  }}
`;
