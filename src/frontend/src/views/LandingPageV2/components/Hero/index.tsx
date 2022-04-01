import Image from "next/image";
import React from "react";
import HeroBackgroundSvg from "src/common/images/landingv2-hero.svg";
import NextstrainLogo from "src/common/images/Nextstrain-Logo-crop.png";
import { ROUTES } from "src/common/routes";
import EmailForm from "./components/HeroEmailForm";
import {
  Heading,
  HeroContainer,
  HeroImage,
  HeroMaxWidthContainer,
  HeroTextSection,
  NextstrainContainer,
  NextstrainLink,
  PartnershipText,
  Tagline,
} from "./style";

export default function Hero(): JSX.Element {
  return (
    <HeroContainer>
      <HeroMaxWidthContainer>
        <HeroTextSection>
          <Heading>No-code phylogenetic analysis</Heading>
          <Tagline>
            An open source, free, no-code genomic epidemiology analysis platform
            for public health
          </Tagline>
          <EmailForm />
        </HeroTextSection>
        <HeroImage>
          <HeroBackgroundSvg />
        </HeroImage>
        <NextstrainContainer>
          <PartnershipText>In partnership with</PartnershipText>
          <NextstrainLink href={ROUTES.NEXTSTRAIN} target="_blank">
            <Image src={NextstrainLogo} alt="" />
          </NextstrainLink>
        </NextstrainContainer>
      </HeroMaxWidthContainer>
    </HeroContainer>
  );
}
