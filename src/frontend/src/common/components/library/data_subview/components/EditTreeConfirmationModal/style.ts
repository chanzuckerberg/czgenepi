import styled from "@emotion/styled";
import { fontHeaderXl, getSpaces } from "czifui";

export const StyledTitle = styled.div`
  ${fontHeaderXl}

  ${(props) => {
    const spaces = getSpaces(props);

    return `
      margin-bottom: ${spaces?.xl}px;
    `;
  }}
`;
