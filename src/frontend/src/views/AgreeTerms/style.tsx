import styled from "@emotion/styled";
import { fontBodyS, fontHeaderXl, getSpacings } from "czifui";

export const Title = styled.div`
  ${fontHeaderXl}
`;

export const Details = styled.p`
  ${fontBodyS}

  ${(props) => {
    const spacings = getSpacings(props);

    return `
      margin-top: ${spacings?.xl}px;
    `;
  }}
`;

export const SpacedBold = styled.b`
  padding: 0 0.3em;
`;
