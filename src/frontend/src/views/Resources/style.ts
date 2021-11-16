import styled from "@emotion/styled";
import { getSpaces } from "czifui";


export const StyledSpan = styled.span`
  ${(props) => {
    const spaces = getSpaces(props);

    return `
      margin-left: ${spaces?.m}px;
    `;
  }}
`;
