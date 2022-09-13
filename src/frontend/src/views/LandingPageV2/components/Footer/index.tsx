import Image from "next/image";
import { useEffect } from "react";
import BiohubLogoImg from "src/common/images/cz-biohub-logo.png";
import CZILogoImg from "src/common/images/czi-logo.png";
import FooterLogo from "src/common/images/gen-epi-logo.svg";
import { ROUTES } from "src/common/routes";
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
  FooterTopListItem,
  Span,
} from "./style";

export default function Footer(): JSX.Element {
  useEffect(() => {
    const script = document.createElement("script");
    script.src =
      "//app.pageproofer.com/embed/f3b4690e-1382-5daa-a36d-03117a611c6d";
    script.async = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return (
    <FooterContainer data-test-id="landing-footer">
      <FooterTopContainer>
        <FooterLogoContainer href={ROUTES.HOMEPAGE}>
          <FooterLogo />
        </FooterLogoContainer>
        <FooterTopLinks>
          <FooterTopListItem>
            <FooterTopLink href={ROUTES.GITHUB} target="_blank">
              Github
            </FooterTopLink>
          </FooterTopListItem>
          <FooterTopListItem>
            <FooterTopLink href={ROUTES.CAREERS} target="_blank">
              Careers
            </FooterTopLink>
          </FooterTopListItem>
          <FooterTopListItem>
            <FooterTopLink href={ROUTES.RESOURCES} target="_blank">
              Learning Center
            </FooterTopLink>
          </FooterTopListItem>
          <FooterTopListItem>
            <FooterTopLink href={ROUTES.GALAGO} target="_blank">
              Galago (Beta)
            </FooterTopLink>
          </FooterTopListItem>
        </FooterTopLinks>
      </FooterTopContainer>
      <FooterBottomContainer>
        <FooterBottomLinks>
          <FooterBottomLink href={ROUTES.PRIVACY} target="_blank">
            Privacy
          </FooterBottomLink>
          <FooterBottomLinkDivider>|</FooterBottomLinkDivider>
          <FooterBottomLink href={ROUTES.TERMS} target="_blank">
            Terms
          </FooterBottomLink>
          <FooterBottomLinkDivider>|</FooterBottomLinkDivider>
          <FooterBottomLink href={ROUTES.CONTACT_US_EMAIL}>
            Contact us
          </FooterBottomLink>
        </FooterBottomLinks>
        <FooterBottomSeparator />
        <FooterPartnerships>
          <CZContainer>
            <Span>In partnership with:</Span>
            <CZLogoContainer>
              <CZILogo href={ROUTES.CZI} target="_blank">
                <Image src={CZILogoImg} alt="" />
              </CZILogo>
              <CZBiohubLogo href={ROUTES.BIOHUB} target="_blank">
                <Image src={BiohubLogoImg} alt="" />
              </CZBiohubLogo>
            </CZLogoContainer>
          </CZContainer>
        </FooterPartnerships>
      </FooterBottomContainer>
    </FooterContainer>
  );
}
