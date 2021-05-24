import styled from "@emotion/styled";
import { getSpacings } from "czifui";
import LogoImage from "src/common/images/logo.svg";

export const Logo = styled(LogoImage)`
  height: 25px;

  ${(props) => {
    const spacings = getSpacings(props);

    return `
      margin-right: ${spacings?.l}px;
    `;
  }}
`;

export const LogoAnchor = styled.a`
  display: flex;
  align-items: center;
  justify-content: center;
`;
