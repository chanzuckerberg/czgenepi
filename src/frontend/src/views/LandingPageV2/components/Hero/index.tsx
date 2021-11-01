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
    NextstrainLink,
    PartnershipText,
    Tagline
} from "./style";
import { ROUTES } from "src/common/routes";

export default function Hero(): JSX.Element {

    return (
        <HeroContainer>
            <HeroMaxWidthContainer>
                <HeroTextSection>
                    <Heading>No-code phylogenetic analysis</Heading>
                    <Tagline>An open source, free, no-code genomic epidemiology analysis platform for public health</Tagline>
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
