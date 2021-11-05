import React from "react";
import HeroBackgroundSvg from "src/common/images/landingv2-hero-bg.svg";
import HeroBackgroundSvgMobile from "src/common/images/landingv2-hero-bg-mob.svg";
import EmailForm from "./components/HeroEmailForm";
import {
    Heading,
    HeroContainer,
    HeroImage,
    HeroTextSection,
    HeroMaxWidthContainer,
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
                    <HeroBackgroundSvgMobile />
                </HeroImage>
            </HeroMaxWidthContainer>
        </HeroContainer>
    );
}