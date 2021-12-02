import React, { useState } from "react";
import Exclamation from "src/common/icons/IconExclamation.svg";
import CloseIcon from "src/common/images/close-icon.svg";
import HeaderLogo from "src/common/images/gen-epi-logo.svg";
import { ROUTES } from "src/common/routes";
import {
  AnnouncementBanner,
  AnnouncementText,
  AnnouncementTextBold,
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
  TextLink,
} from "./style";

export default function NavBarV2(): JSX.Element {
  const [menuOpen, setMenuOpen] = useState(false);

  function toggleMobileNav() {
    setMenuOpen(!menuOpen);
  }

  return (
    <HeaderContainer>
      <AnnouncementBanner>
        <AnnouncementText>
          <Exclamation />
          <AnnouncementTextBold>Looking for Aspen?</AnnouncementTextBold>
          &nbsp;You&apos;re in the right spot. As of December, our new name is
          CZ GEN EPI.
        </AnnouncementText>
      </AnnouncementBanner>
      <HeaderMaxWidthContainer>
        <HeaderTopContainer>
          <HeaderLogoContainer href={ROUTES.HOMEPAGE}>
            <HeaderLogo />
          </HeaderLogoContainer>
          <HeaderTopLinks>
            <TextLink href={ROUTES.RESOURCES} target="_blank">
              Resources
            </TextLink>
            <ButtonLink href={ROUTES.REQUEST_ACCESS}>Request Access</ButtonLink>
            <ButtonLink href={ROUTES.LOGIN}>Sign in</ButtonLink>
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
              <MobileNavLink
                href={ROUTES.LOGIN}
                style={menuOpen ? { opacity: "1" } : { opacity: "0" }}
                target="_blank"
                rel="noreferrer"
                aria-label="View the Aspen login page (opens in new window)"
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
            </MobileNavLinkContainer>
          </MobileNavTray>
        </HeaderTopContainer>
      </HeaderMaxWidthContainer>
    </HeaderContainer>
  );
}
