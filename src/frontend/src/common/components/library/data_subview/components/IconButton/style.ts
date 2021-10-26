import styled from "@emotion/styled";
import { getSpaces } from "czifui";

export const StyledSpan = styled.span`
  display: flex;
  ${(props) => {
    const spacings = getSpaces(props);
    return `
      margin-left: ${spacings?.m}px;
    `;
  }}
`;
