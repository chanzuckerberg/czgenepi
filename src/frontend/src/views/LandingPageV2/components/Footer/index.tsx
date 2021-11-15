import React from "react";
import BiohubLogo from "src/common/images/cz-biohub-logo.png";
import CZILogo from "src/common/images/czi-logo.png";
import FooterLogo from "src/common/images/logo.svg";
import NextstrainLogo from "src/common/images/Nextstrain-logo-crop.png";
import {
    CZContainer,
    CZLogoContainer,
    FooterBottomContainer,
    FooterBottomLinks,
    FooterBottomSeparator,
    FooterContainer,
    FooterLogoContainer,
    FooterPartnerships,
    FooterTopContainer,
    FooterTopLinks,
    NextstrainContainer
} from "./style";

export default function Footer(): JSX.Element {

    return (
        <FooterContainer>
            <FooterTopContainer>
                <FooterLogoContainer>
                    <FooterLogo />
                </FooterLogoContainer>
                <FooterTopLinks>
                    <a href="/">Github</a>
                    <a href="/">Careers</a>
                    <a href="/">Resources</a>
                </FooterTopLinks>
            </FooterTopContainer>
            <FooterBottomContainer>
                <FooterBottomLinks>
                    <a href="/">Privacy</a>
                    <span>|</span>
                    <a href="/">Terms</a>
                    <span>|</span>
                    <a href="/">Contact us</a>
                </FooterBottomLinks>
                <FooterBottomSeparator />
                <FooterPartnerships>
                    <NextstrainContainer>
                        <span>Powered by:</span>
                        <img src={NextstrainLogo.src} alt="" />
                    </NextstrainContainer>
                    <CZContainer>
                        <span>In partnership with:</span>
                        <CZLogoContainer>
                            <img src={CZILogo.src} alt="" />
                            <img src={BiohubLogo.src} alt="" />
                        </CZLogoContainer>
                    </CZContainer>
                </FooterPartnerships>
            </FooterBottomContainer>
        </FooterContainer>
    );
}