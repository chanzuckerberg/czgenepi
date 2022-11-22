import styled from "@emotion/styled";
import { CommonThemeProps, getSpaces } from "czifui";

export const MaxWidth = styled.div`
  display: flex;
  flex-direction: column;
  max-width: 1300px;
  max-height: 100%;
  overflow-y: auto;
  margin: auto;
  flex: 1 1 0;
  min-width: 0;

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
  height: 100%;
`;
