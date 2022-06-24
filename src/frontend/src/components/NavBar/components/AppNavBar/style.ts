import styled from "@emotion/styled";
import { fontHeaderL, getColors, getSpaces } from "czifui";
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

export const Separator = styled.div`
  ${(props) => {
    const colors = getColors(props);
    const spaces = getSpaces(props);

    return `
      border-left: 1px solid ${colors?.gray[200]};
      margin-right: ${spaces?.l}px;
      height: 100%;
    `;
  }}
`;

export const LeftNav = styled.div`
  display: flex;
  justify-content: flex-start;
  align-items: center;
  flex: auto;
  height: 25px;

  ${(props) => {
    const spaces = getSpaces(props);

    return `
      margin-left: ${spaces?.xl}px;
    `;
  }}
`;

export const NavBar = styled.div`
  background-color: black;
  height: 50px;
  display: flex;
  align-items: center;
`;

export const NavOrg = styled.div`
  ${fontHeaderL}

  height: 100%;
  color: white;
  align-items: center;
  display: flex;

  a {
    color: white;
  }
`;

export const StyledIcon = styled.div`
  ${(props) => {
    const spaces = getSpaces(props);

    return `
      path {
        fill: white;
      }
      margin: 0 ${spaces?.l}px;
    `;
  }}
`;

export const DropdownClickTarget = styled.span`
  cursor: pointer;
  display: flex;
`;
