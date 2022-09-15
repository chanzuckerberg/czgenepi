import styled from "@emotion/styled";
import { SmallerThanBreakpoint } from "src/common/styles/mixins/global";

export const Bar = styled.div`
  width: 17px;
  height: 1px;
  background-color: #ffffff;
  margin: 5px 0;
`;

export const ButtonLink = styled.a`
  display: inline-block;
  margin: 0 8px;
  padding: 7px 14px 6px 14px;
  border: 1px solid #ffffff;
  border-radius: 24px;
  width: 140px;
  text-align: center;
  font-size: 13px;
  font-weight: 600;
  line-height: 20px;
  letter-spacing: 0.3px;

  &:hover {
    background: #ffffff;
    color: #000000;
  }
`;

export const HeaderTopLinks = styled.div`
  position: relative;
  z-index: 2;
  span {
    font-size: 14px;
  }

  ${SmallerThanBreakpoint(`
    display: none;
  `)}
`;

export const HeaderContainer = styled.header`
  background: black;
  color: white;

  & a {
    color: white;
    font-size: 14px;
    font-weight: 400;
    line-height: 24px;
    letter-spacing: 0.3px;
  }
`;

export const HeaderLogoContainer = styled.a`
  width: 100%;
  max-width: fit-content;
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;

  ${SmallerThanBreakpoint(`
    flex-direction: column;
    align-items: flex-start;
  `)}
`;

export const HeaderMaxWidthContainer = styled.div`
  max-width: 1440px;
  margin: 0 auto;
`;

export const HeaderTopContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 38px 60px;

  ${SmallerThanBreakpoint(`
    padding: 17px 20px;
  `)}
`;

export const MobileNavClose = styled.span`
  cursor: pointer;
  padding-right: 26px;
`;

export const MobileNavCloseContainer = styled.div`
  width: 100%;
  text-align: right;
  padding-top: 24px;
`;

export const MobileNavLink = styled.a`
  display: block;
  text-decoration: none;
  color: #000000 !important;
  @include font-body-xs;
  font-weight: 600;
  margin: 22px 0;
  transition: opacity 0.2s;
`;

export const MobileNavLinkContainer = styled.div`
  padding-top: 30px;
  padding-left: 40px;
`;

export const MobileNavSeparator = styled.div`
  width: 60px;
  height: 1px;
  background-color: #cccccc;
`;

export const MobileNavToggle = styled.div`
  display: none;
  position: relative;
  z-index: 2;

  ${SmallerThanBreakpoint(`
    display: inline-block;
    cursor: pointer;
  `)}
`;

export const MobileNavTray = styled.div`
  height: 100vh;
  width: 90%;
  max-width: 260px;
  position: fixed;
  right: 0;
  top: 0;
  background-color: #ffffff;
  z-index: 10;
  transition: all 0.4s;
  display: none;
  ${SmallerThanBreakpoint(`
    display: inline-block;
    cursor: pointer;
  `)}
`;

export const OrgSplash = styled.span`
  font-size: 16px;
  font-weight: bold;

  @media (min-width: 769px) {
    margin-left: 1em;
    padding-left: 1em;
    border-left: 1px solid white;
  }
`;

export const TextLink = styled.a`
  margin: 0 10px;
`;
