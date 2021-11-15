import React, { useState } from "react";
import HeaderLogo from "src/common/images/logo.svg";
import {
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
    TextLink
} from "./style";

export default function NavBarV2(): JSX.Element {

    const [menuOpen, setMenuOpen] = useState(false);

    function toggleMobileNav() {
        setMenuOpen(!menuOpen);
    }

    return (
        <HeaderContainer>
            <HeaderMaxWidthContainer>
                <HeaderTopContainer>
                    <HeaderLogoContainer href="/">
                        <HeaderLogo />
                    </HeaderLogoContainer>
                    <HeaderTopLinks>
                        <TextLink href="/">Resources</TextLink>
                        <ButtonLink href="/">Request Access</ButtonLink>
                        <ButtonLink href="/">Sign in</ButtonLink>
                    </HeaderTopLinks>
                    <MobileNavToggle
                        onClick={toggleMobileNav}
                        onKeyDown={toggleMobileNav}
                        >
                        <div className="bar1"></div>
                        <div className="bar2"></div>
                        <div className="bar3"></div>
                    </MobileNavToggle>
                    <MobileNavTray style={menuOpen ? { width: "100%" } : { width: "0" }} >
                        <MobileNavCloseContainer>
                            <MobileNavClose
                                onClick={toggleMobileNav}
                                onKeyDown={toggleMobileNav}
                            >
                                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M0.942054 1.17678L12.5885 12.8232" stroke="#999999" stroke-width="2"/>
                                    <path d="M0.942041 12.8233L12.5885 1.1768" stroke="#999999" stroke-width="2"/>
                                </svg>
                            </MobileNavClose>
                        </MobileNavCloseContainer>
                        <MobileNavLinkContainer>
                            <MobileNavLink
                                href="/"
                                style={menuOpen ? { opacity: "1" } : { opacity: "0" }}
                                target="_blank"
                                rel="noreferrer"
                                aria-label="View the Aspen GitHub page (opens in new window)"
                                >
                                Github
                            </MobileNavLink>
                            <MobileNavLink
                                href="/"
                                style={menuOpen ? { opacity: "1" } : { opacity: "0" }}
                                target="_blank"
                                rel="noreferrer"
                                aria-label="View the Aspen Careers page (opens in new window)"
                                >
                                Careers
                            </MobileNavLink>
                            <MobileNavLink
                                href="/"
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
                                href="/"
                                style={menuOpen ? { opacity: "1" } : { opacity: "0" }}
                                target="_blank"
                                rel="noreferrer"
                                aria-label="View the Aspen login page (opens in new window)"
                                >
                                Sign In
                            </MobileNavLink>
                            <MobileNavLink
                                href="/"
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