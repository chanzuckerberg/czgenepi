import styled from "@emotion/styled";
import { getSpaces } from "czifui";
import LogoImage from "src/common/images/logo_complete_white.svg";

export const Logo = styled(LogoImage)`
  height: 25px;

  ${(props) => {
    const spaces = getSpaces(props);

    return `
      margin-right: ${spaces?.l}px;
    `;
  }}
`;

export const LogoAnchor = styled.a`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
`;
