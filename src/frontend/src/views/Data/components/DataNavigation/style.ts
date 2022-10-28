import styled from "@emotion/styled";
import { CommonThemeProps, getColors, getSpaces } from "czifui";

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
