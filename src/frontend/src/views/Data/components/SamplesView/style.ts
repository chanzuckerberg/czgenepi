import styled from "@emotion/styled";
import { CommonThemeProps, getSpaces } from "czifui";

export const MaxWidth = styled.div`
  width: 1300px;
  margin: auto;
  ${(props: CommonThemeProps) => {
    const spaces = getSpaces(props);
    return `
      padding: 0 ${spaces?.l}px;
    `;
  }}
`;

export const StyledActionBar = styled.div`
  display: flex;
  justify-content: space-between;
`;

export const Flex = styled.div`
  display: flex;
`;
