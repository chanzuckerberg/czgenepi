import React, { useState } from "react";
import { API } from "src/common/api";
import ENV from "src/common/constants/ENV";
import CloseIcon from "src/common/images/close-icon.svg";
import HeaderLogo from "src/common/images/gen-epi-logo.svg";
import { useUserInfo } from "src/common/queries/auth";
import { ROUTES } from "src/common/routes";
import { getCurrentGroupFromUserInfo } from "src/common/utils/userInfo";
import UserMenu from "../RightNav/components/UserMenu";
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

/*
 * This nav bar is shown when a user is either not authenticated or
 * viewing pages that are "outside" the application, such as the
 * landing page, privacy page, etc.
 */
export default function StaticPageNavBar(): JSX.Element {
  const [menuOpen, setMenuOpen] = useState(false);

  function toggleMobileNav() {
    setMenuOpen(!menuOpen);
  }

  const { API_URL } = ENV;

  const { data: userInfo } = useUserInfo();
  const group = getCurrentGroupFromUserInfo(userInfo);

  const orgElements = <React.Fragment>{group?.name}</React.Fragment>;

  function hasOrg(): JSX.Element | null {
    if (group === undefined) {
      return null;
    } else {
      return orgElements;
    }
  }

  const orgSplash = hasOrg();

  let MobileRightNav;
  let RightNav;

  if (userInfo) {
    MobileRightNav = (
      <MobileNavLink
        href={ROUTES.UPLOAD_STEP1}
        style={menuOpen ? { opacity: "1" } : { opacity: "0" }}
        rel="noreferrer"
        aria-label="Upload Data"
      >
        Upload
      </MobileNavLink>
    );

    RightNav = <UserMenu user={userInfo.name} />;
  } else {
    MobileRightNav = (
      <>
        <MobileNavLink
          href={API_URL + API.LOG_IN}
          style={menuOpen ? { opacity: "1" } : { opacity: "0" }}
          rel="noreferrer"
          aria-label="Log into CZI GEN EPI"
        >
          Sign In
        </MobileNavLink>
        <MobileNavLink
          href={ROUTES.REQUEST_ACCESS}
          style={menuOpen ? { opacity: "1" } : { opacity: "0" }}
          target="_blank"
          rel="noreferrer"
          aria-label="Request access to Aspen (opens in new window)"
        >
          Request Access
        </MobileNavLink>
      </>
    );

    RightNav = (
      <>
        <TextLink href={ROUTES.RESOURCES} target="_blank">
          Learning Center
        </TextLink>
        <ButtonLink
          data-test-id="navbar-sign-in-link"
          href={API_URL + API.LOG_IN}
        >
          Sign in
        </ButtonLink>
        <ButtonLink href={ROUTES.REQUEST_ACCESS}>Request Access</ButtonLink>
      </>
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
          <HeaderTopLinks>{RightNav}</HeaderTopLinks>
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
                Learning Center
              </MobileNavLink>
              <MobileNavSeparator
                style={menuOpen ? { opacity: "1" } : { opacity: "0" }}
              ></MobileNavSeparator>
              {MobileRightNav}
            </MobileNavLinkContainer>
          </MobileNavTray>
        </HeaderTopContainer>
      </HeaderMaxWidthContainer>
    </HeaderContainer>
  );
}
