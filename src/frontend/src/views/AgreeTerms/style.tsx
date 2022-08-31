import styled from "@emotion/styled";
import { fontBodyS, fontHeaderXl, getColors, getSpaces, Icon } from "czifui";

export const Title = styled.div`
  ${fontHeaderXl}
`;

export const Details = styled.p`
  ${fontBodyS}

  ${(props) => {
    const spaces = getSpaces(props);

    return `
      margin-top: ${spaces?.xl}px;
    `;
  }}
`;

export const SpacedBold = styled.b`
  padding: 0 0.3em;
`;

export const StyledIcon = styled(Icon)`
  ${(props) => {
    const colors = getColors(props);

    return `
      fill: ${colors?.gray[500]};
    `;
  }}
`;
