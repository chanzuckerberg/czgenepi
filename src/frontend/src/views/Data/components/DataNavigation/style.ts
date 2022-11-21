import styled from "@emotion/styled";
import { CommonThemeProps, getColors, getSpaces, Tabs } from "czifui";

export const Navigation = styled.div`
  display: flex;
  width: 100%;

  ${(props: CommonThemeProps) => {
    const colors = getColors(props);
    const spaces = getSpaces(props);

    return `
      border-bottom: ${spaces?.xxs}px solid ${colors?.gray[200]};
    `;
  }}
`;

export const StyledTabs = styled(Tabs)`
  ${(props: CommonThemeProps) => {
    const spaces = getSpaces(props);
    return `
      margin: ${spaces?.l}px;
    `;
  }}
`;
