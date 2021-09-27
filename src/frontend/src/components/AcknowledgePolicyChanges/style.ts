import styled from "@emotion/styled";
import { fontHeaderXs, getColors, getSpacings } from "czifui";

export const Container = styled.div`
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  ${(props) => {
    const colors = getColors(props);
    const spacings = getSpacings(props);
    return `
      background-color: ${colors?.primary[400]};
      padding: 0 ${spacings?.l}px;
    `;
  }}
`;
