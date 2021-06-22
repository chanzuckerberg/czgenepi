import styled from "@emotion/styled";
import { getColors, getCorners, getSpacings } from "czifui";

export const Circle = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;

  height: 30px;
  width: 30px;

  color: "white";

  ${(props) => {
    const colors = getColors(props);
    const corners = getCorners(props);
    const spacings = getSpacings(props);

    return `
      background-color: ${colors?.primary[400]};
      border-radius: ${corners?.l}px;
      margin-bottom: ${spacings?.xs}px;
    `;
  }}
`;
