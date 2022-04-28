import React, { useState } from "react";
import ENV from "src/common/constants/ENV";
import CloseIcon from "src/common/images/close-icon.svg";
import HeaderLogo from "src/common/images/gen-epi-logo.svg";
import { useUserInfo } from "src/common/queries/auth";
import { ROUTES } from "src/common/routes";
import UserMenu from "./components/UserMenu";
import {
  Bar,
  ButtonLink,
  HeaderContainer,
  HeaderLogoContainer,
  HeaderMaxWidthContainer,
  HeaderTopContainer,
  HeaderTopLinks,
  MobileNavClose,
  MobileNavCloseContainer,
  MobileNavLink,
  MobileNavLinkContainer,
  MobileNavSeparator,
  MobileNavToggle,
  MobileNavTray,
  OrgSplash,
  TextLink,
} from "./style";

export default function NavBarLanding(): JSX.Element {
  const [menuOpen, setMenuOpen] = useState(false);

  function toggleMobileNav() {
    setMenuOpen(!menuOpen);
  }

  const { API_URL } = ENV;

  const { data: userInfo } = useUserInfo();

  const group = userInfo?.group;

  const orgElements = <React.Fragment>{group?.name}</React.Fragment>;

  function hasOrg(): JSX.Element | null {
    if (group === undefined) {
      return null;
    } else {
      return orgElements;
    }
  }

  const orgSplash = hasOrg();

  let MobileSignInLink;
  let SignInLink;

  if (userInfo) {
    MobileSignInLink = (
      <MobileNavLink
        href={ROUTES.UPLOAD_STEP1}
        style={menuOpen ? { opacity: "1" } : { opacity: "0" }}
        rel="noreferrer"
        aria-label="Upload Data"
      >
        Upload
      </MobileNavLink>
    );

    SignInLink = <ButtonLink href={ROUTES.UPLOAD_STEP1}>Upload</ButtonLink>;
  } else {
    MobileSignInLink = (
      <MobileNavLink
        href={API_URL + ROUTES.LOGIN}
        style={menuOpen ? { opacity: "1" } : { opacity: "0" }}
        rel="noreferrer"
        aria-label="Log into CZI GEN EPI"
      >
        Sign In
      </MobileNavLink>
    );
    SignInLink = (
      <ButtonLink
        data-test-id="navbar-sign-in-link"
        href={API_URL + ROUTES.LOGIN}
      >
        Sign in
      </ButtonLink>
    );
  }

  return (
    <HeaderContainer data-test-id="navbar-landing">
      <HeaderMaxWidthContainer>
        <HeaderTopContainer>
          <HeaderLogoContainer href={userInfo ? ROUTES.DATA : ROUTES.HOMEPAGE}>
            <HeaderLogo data-test-id="logo" />
            {orgSplash ? <OrgSplash>{orgSplash}</OrgSplash> : null}
          </HeaderLogoContainer>
          <HeaderTopLinks>
            {userInfo ? null : (
              <TextLink href={ROUTES.RESOURCES} target="_blank">
                Resources
              </TextLink>
            )}
            {userInfo ? null : (
              <ButtonLink href={ROUTES.REQUEST_ACCESS}>
                Request Access
              </ButtonLink>
            )}
            {SignInLink}
            {userInfo ? <UserMenu user={userInfo.name} /> : null}
          </HeaderTopLinks>
          <MobileNavToggle
            onClick={toggleMobileNav}
            onKeyDown={toggleMobileNav}
          >
            <Bar></Bar>
            <Bar></Bar>
            <Bar></Bar>
          </MobileNavToggle>
          <MobileNavTray style={menuOpen ? { width: "100%" } : { width: "0" }}>
            <MobileNavCloseContainer>
              <MobileNavClose
                onClick={toggleMobileNav}
                onKeyDown={toggleMobileNav}
              >
                <CloseIcon />
              </MobileNavClose>
            </MobileNavCloseContainer>
            <MobileNavLinkContainer>
              <MobileNavLink
                href={ROUTES.GITHUB}
                style={menuOpen ? { opacity: "1" } : { opacity: "0" }}
                target="_blank"
                rel="noreferrer"
                aria-label="View the Aspen GitHub page (opens in new window)"
              >
                Github
              </MobileNavLink>
              <MobileNavLink
                href={ROUTES.CAREERS}
                style={menuOpen ? { opacity: "1" } : { opacity: "0" }}
                target="_blank"
                rel="noreferrer"
                aria-label="View the Aspen Careers page (opens in new window)"
              >
                Careers
              </MobileNavLink>
              <MobileNavLink
                href={ROUTES.RESOURCES}
                style={menuOpen ? { opacity: "1" } : { opacity: "0" }}
                target="_blank"
                rel="noreferrer"
                aria-label="View the Aspen Help page (opens in new window)"
              >
                Resources
              </MobileNavLink>
              <MobileNavSeparator
                style={menuOpen ? { opacity: "1" } : { opacity: "0" }}
              ></MobileNavSeparator>
              {MobileSignInLink}
              {userInfo ? null : (
                <MobileNavLink
                  href={ROUTES.REQUEST_ACCESS}
                  style={menuOpen ? { opacity: "1" } : { opacity: "0" }}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Request access to Aspen (opens in new window)"
                >
                  Request Access
                </MobileNavLink>
              )}
            </MobileNavLinkContainer>
          </MobileNavTray>
        </HeaderTopContainer>
      </HeaderMaxWidthContainer>
    </HeaderContainer>
  );
}
