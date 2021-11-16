import React from "react";
import Image from "next/image";
import UsherLogoImg from "src/common/images/usher-logo.png";
import PangolinLogoImg from "src/common/images/pangolin-logo.png";
import NextstrainLogoImg from "src/common/images/nextstrain-logo-full.png";
import {
    NextstrainLogo,
    PangolinLogo,
    PartnerLink,
    PartnersSectionContainer,
    UsherLogo
} from "./style";

export default function IntroSection(): JSX.Element {

    return (
        <PartnersSectionContainer>
            <PartnerLink
                href="/"
                target="_blank"
                >
                <UsherLogo>
                    <Image src={UsherLogoImg} />
                </UsherLogo>
            </PartnerLink>
            <PartnerLink
                href="/"
                target="_blank"
                >
                <PangolinLogo>
                    <Image src={PangolinLogoImg} />
                </PangolinLogo>
            </PartnerLink>
            <PartnerLink
                href="/"
                target="_blank"
                >
                <NextstrainLogo>
                    <Image src={NextstrainLogoImg} />
                </NextstrainLogo>
            </PartnerLink>
        </PartnersSectionContainer>
    );
}