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
    const spaces = getSpaces(props);

    return `
      margin-bottom: ${spaces?.xxxs}px;
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
    const spaces = getSpaces(props);
    return `
      color: ${colors?.gray[500]};
      padding: 0 ${spaces?.xxl}px ${spaces?.xxl}px ${spaces?.xxl}px;
      margin: -${(spaces?.s || 0) + (spaces?.xl || 0)}px 0 0 0;
    `;
  }}
`;
