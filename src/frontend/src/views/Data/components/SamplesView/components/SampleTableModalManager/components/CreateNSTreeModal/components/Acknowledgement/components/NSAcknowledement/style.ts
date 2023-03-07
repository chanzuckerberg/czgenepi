import styled from "@emotion/styled";
import NextstrainLogoImg from "src/common/images/nextstrain-inline.svg";
import { fontBodyS, getColors, getSpaces } from "czifui";

export const Attribution = styled.p`
  ${fontBodyS}

  display: flex;
  align-items: center;

  ${(props) => {
    const colors = getColors(props);
    const spaces = getSpaces(props);

    return `
      color: ${colors?.gray[600]};
      margin: 0 0 ${spaces?.m}px;
    `;
  }}
`;

export const NextstrainLogo = styled(NextstrainLogoImg)`
  width: 90px;
`;
