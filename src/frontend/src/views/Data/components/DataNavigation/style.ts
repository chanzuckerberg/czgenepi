import styled from "@emotion/styled";
import { getColors, getSpaces } from "czifui";

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

export const StyledMenu = styled.ul`
  align-items: center;
  display: flex;
  flex-direction: row;
  padding: 0;
`;

export const StyledMenuItem = styled.li`
  list-style: none;
  padding: 0;
  ${(props: CommonThemeProps) => {
    const spaces = getSpaces(props);

    return `
      margin: 0 ${spaces?.m}px;
    `;
  }}
`;
