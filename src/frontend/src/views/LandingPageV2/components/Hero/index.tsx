import React from "react";
import HeroBackgroundSvg from "src/common/images/landingv2-hero-bg.svg";
import EmailForm from "./components/HeroEmailForm";
import {
    Heading,
    HeroContainer,
    HeroImage,
    HeroText,
    Tagline
} from "./style";

export default function Hero(): JSX.Element {

    return (
        <HeroContainer>
            <HeroText>
                <Heading>Harness the Power of Genomic Sequencing</Heading>
                <Tagline>Cras justo odio, dapibus ac facilisis in, egestas eget quam.</Tagline>
                <EmailForm />
            </HeroText>
            <HeroImage>
                <HeroBackgroundSvg />
            </HeroImage>
        </HeroContainer>
    );
}