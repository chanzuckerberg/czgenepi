import styled from "@emotion/styled";
import {
  fontBodyS,
  fontBodyXxs,
  fontHeaderL,
  getColors,
  getSpacings,
} from "czifui";

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

export const StyledFooter = styled.div`
  ${fontBodyXxs}

  ${(props) => {
    const colors = getColors(props);
    const spacings = getSpacings(props);
    return `
      color: ${colors?.gray[500]};
      padding: 0 ${spacings?.xxl}px ${spacings?.xxl}px ${spacings?.xxl}px;
      margin: -${spacings?.s + spacings?.xl}px 0 0 0;
    `;
  }}
`;
