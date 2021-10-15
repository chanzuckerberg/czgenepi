import styled from "@emotion/styled";
import { fontHeaderXl, getColors, getSpacings } from "czifui";
import { P } from "src/common/styles/support/style";

export const StyledHeader = styled.div`
  ${fontHeaderXl}
`;

export const StyledImg = styled("img")`
  height: 45px;

  ${(props) => {
    const spacings = getSpacings(props);

    return `
      margin-bottom: ${spacings?.l}px;
    `;
  }}
`;

export const StyledP = styled(P)`
  ${(props) => {
    const colors = getColors(props);
    return `
      color: ${colors?.gray[500]};
    `;
  }}
`;
