import styled from "@emotion/styled";
import { CommonThemeProps, getSpaces } from "czifui";

export const MaxWidth = styled.div`
  display: flex;
  flex-direction: column;
  max-width: 1300px;
  overflow-y: auto;
  margin: 0 auto;
  flex: 1 1 0;
  min-width: 0;
  width: 100%;

  ${(props: CommonThemeProps) => {
    const spaces = getSpaces(props);
    return `
      padding: ${spaces?.xl}px ${spaces?.l}px;
    `;
  }}
`;

export const StyledActionBar = styled.div`
  display: flex;
  justify-content: space-between;
  flex: 0 0 auto;
`;

export const Flex = styled.div`
  display: flex;
  flex: 1 1 0;
  min-height: 0;
`;
