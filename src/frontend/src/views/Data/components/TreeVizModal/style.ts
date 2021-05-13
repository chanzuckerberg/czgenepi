import styled from "@emotion/styled";
import { fontBodyS, fontHeaderXl, getColors, getSpacings, Props } from "czifui";

export const Header = styled.div`
  ${fontHeaderXl}
  ${(props: Props) => {
    const spacings = getSpacings(props);

    return `
      margin-bottom: ${spacings?.s}px;
    `;
  }}
`;

export const Content = styled.div`
  ${fontBodyS}

  ${(props) => {
    const colors = getColors(props);

    return `
      color: ${colors?.gray[500]};
    `;
  }}
`;
