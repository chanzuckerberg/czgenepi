import styled from "@emotion/styled";
import {
  fontBodyS,
  fontBodyXxs,
  fontHeaderL,
  getColors,
  getSpaces,
} from "czifui";
import { narrow } from "src/common/components/library/Dialog/components/common";

export const Title = styled.div`
  ${fontHeaderL}

  ${(props) => {
    const spacings = getSpaces(props);

    return `
      margin-bottom: ${spacings?.xxxs}px;
    `;
  }}
`;

export const Content = styled.div`
  ${fontBodyS}
`;

export const StyledFooter = styled.div`
  ${fontBodyXxs}
  ${narrow}

  ${(props) => {
    const colors = getColors(props);
    const spacings = getSpaces(props);
    return `
      color: ${colors?.gray[500]};
      padding: 0 ${spacings?.xxl}px ${spacings?.xxl}px ${spacings?.xxl}px;
      margin: -${(spacings?.s || 0) + (spacings?.xl || 0)}px 0 0 0;
    `;
  }}
`;
