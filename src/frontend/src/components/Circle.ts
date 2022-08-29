import styled from "@emotion/styled";
import { CommonThemeProps, getColors, getCorners, getSpaces } from "czifui";

export const Circle = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;

  height: 30px;
  width: 30px;

  color: "white";

  ${(props: CommonThemeProps) => {
    const colors = getColors(props);
    const corners = getCorners(props);
    const spaces = getSpaces(props);

    return `
      background-color: ${colors?.primary[400]};
      border-radius: ${corners?.l}px;
      margin-bottom: ${spaces?.xs}px;
    `;
  }}
`;
