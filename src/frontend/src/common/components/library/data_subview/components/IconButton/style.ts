import styled from "@emotion/styled";
import { getSpacings } from "czifui";

export const StyledSpan = styled.span`
  display: flex;
  ${(props) => {
    const spacings = getSpacings(props);
    return `
    margin-left: ${spacings?.m}px;
  `;
  }}
`;
