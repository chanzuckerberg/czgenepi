import React, { useEffect } from "react";
import BiohubLogo from "src/common/images/cz-biohub-logo.png";
import CZILogo from "src/common/images/czi-logo.png";
import FooterLogo from "src/common/images/logo.svg";
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
    FooterTopLinks
} from "./style";

export default function Footer(): JSX.Element {

    useEffect(() => {
        const script = document.createElement('script');
        script.src = '//app.pageproofer.com/embed/f3b4690e-1382-5daa-a36d-03117a611c6d';
        script.async = true;
        document.body.appendChild(script);
      return () => {
          document.body.removeChild(script);
        }
      }, []);

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