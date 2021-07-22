import styled from "@emotion/styled";
import { getColors, getSpacings } from "czifui";

export const StyledDiv = styled.div`
  display: inline;
  font-weight: 550;

  ${(props) => {
    const spacings = getSpacings(props);
    const colors = getColors(props);

    return `
    padding: ${spacings?.l}px;
    margin-right: ${spacings?.m}px;
    color: black;
    border-right: 2px solid ${colors?.gray[500]};
`;
  }}
`;
