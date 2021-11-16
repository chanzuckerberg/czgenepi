import React, { useEffect } from "react";
import Image from 'next/image';
import BiohubLogoImg from "src/common/images/cz-biohub-logo.png";
import CZILogoImg from "src/common/images/czi-logo.png";
import FooterLogo from "src/common/images/logo.svg";
import {
    CZBiohubLogo,
    CZContainer,
    CZILogo,
    CZLogoContainer,
    FooterBottomContainer,
    FooterBottomLink,
    FooterBottomLinkDivider,
    FooterBottomLinks,
    FooterBottomSeparator,
    FooterContainer,
    FooterLogoContainer,
    FooterPartnerships,
    FooterTopContainer,
    FooterTopLink,
    FooterTopLinks,
    Span
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
                    <FooterTopLink href="/">Github</FooterTopLink>
                    <FooterTopLink href="/">Careers</FooterTopLink>
                    <FooterTopLink href="/">Resources</FooterTopLink>
                </FooterTopLinks>
            </FooterTopContainer>
            <FooterBottomContainer>
                <FooterBottomLinks>
                    <FooterBottomLink href="/">Privacy</FooterBottomLink>
                    <FooterBottomLinkDivider>|</FooterBottomLinkDivider>
                    <FooterBottomLink href="/">Terms</FooterBottomLink>
                    <FooterBottomLinkDivider>|</FooterBottomLinkDivider>
                    <FooterBottomLink href="/">Contact us</FooterBottomLink>
                </FooterBottomLinks>
                <FooterBottomSeparator />
                <FooterPartnerships>
                    <CZContainer>
                        <Span>In partnership with:</Span>
                        <CZLogoContainer>
                            <CZILogo>
                                <Image src={CZILogoImg} alt="" />
                            </CZILogo>
                            <CZBiohubLogo>
                                <Image src={BiohubLogoImg} alt="" />
                            </CZBiohubLogo>
                        </CZLogoContainer>
                    </CZContainer>
                </FooterPartnerships>
            </FooterBottomContainer>
        </FooterContainer>
    );
}