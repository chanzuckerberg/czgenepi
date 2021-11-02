import styled from "@emotion/styled";
import { fontHeaderXl, getColors, getSpaces } from "czifui";
import Image from "next/image";
import { P } from "src/common/styles/support/style";

export const StyledHeader = styled.div`
  ${fontHeaderXl}
`;

export const StyledImg = styled(Image)`
  height: 45px;

  ${(props) => {
    const spaces = getSpaces(props);

    return `
      margin-bottom: ${spaces?.l}px;
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
