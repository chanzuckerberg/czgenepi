import styled from "@emotion/styled";
import { getColors, getSpacings } from "czifui";

export const StyledFilterPanel = styled.div`
  ${(props) => {
    const colors = getColors(props);
    const spacings = getSpacings(props);
    return `
    border-right: ${spacings?.xxxs}px ${colors?.gray[200]} solid;
    width: 200px;
    `;
  }}
`;
