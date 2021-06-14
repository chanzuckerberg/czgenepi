import styled from "@emotion/styled";
import { fontBodyS, fontHeaderL, getSpacings } from "czifui";

export const Title = styled.div`
  ${fontHeaderL}

  ${(props) => {
    const spacings = getSpacings(props);

    return `
      margin-bottom: ${spacings?.s}px;
    `;
  }}
`;

export const Content = styled.div`
  ${fontBodyS}
`;
