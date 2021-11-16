import React, { useState } from "react";
import CloseIcon from "src/common/images/close-icon.svg";
import HeaderLogo from "src/common/images/logo.svg";
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
                        <Bar></Bar>
                        <Bar></Bar>
                        <Bar></Bar>
                    </MobileNavToggle>
                    <MobileNavTray style={menuOpen ? { width: "100%" } : { width: "0" }} >
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