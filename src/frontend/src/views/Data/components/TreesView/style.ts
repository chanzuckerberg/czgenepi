import styled from "@emotion/styled";
import { CommonThemeProps, getSpaces } from "czifui";

export const Flex = styled.div`
  display: flex;
  justify-content: space-between;

  ${(props: CommonThemeProps) => {
    const spaces = getSpaces(props);
    return `
      margin-bottom: ${spaces?.l}px;
    `;
  }}
`;
