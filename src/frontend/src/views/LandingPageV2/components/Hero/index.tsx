import React from "react";
import Image from 'next/image';
import HeroBackgroundSvg from "src/common/images/landingv2-hero-bg.svg";
import EmailForm from "./components/HeroEmailForm";
import NextstrainLogo from "src/common/images/Nextstrain-Logo-crop.png";
import {
    Heading,
    HeroContainer,
    HeroImage,
    HeroTextSection,
    HeroMaxWidthContainer,
    NextstrainContainer,
    PartnershipText,
    Tagline
} from "./style";

export default function Hero(): JSX.Element {

    return (
        <HeroContainer>
            <HeroMaxWidthContainer>
                <HeroTextSection>
                    <Heading>Harness the Power of Genomic Sequencing</Heading>
                    <Tagline>Cras justo odio, dapibus ac facilisis in, egestas eget quam.</Tagline>
                    <EmailForm />
                </HeroTextSection>
                <HeroImage>
                    <HeroBackgroundSvg />
                </HeroImage>
                <NextstrainContainer>
                    <PartnershipText>In partnership with</PartnershipText>
                    <Image src={NextstrainLogo} alt="" />
                </NextstrainContainer>
            </HeroMaxWidthContainer>
        </HeroContainer>
    );
}