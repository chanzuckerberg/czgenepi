import React from "react";
import UsherLogo from "src/common/images/usher-logo.png";
import PangolinLogo from "src/common/images/pangolin-logo.png";
import NextstrainLogo from "src/common/images/nextstrain-logo-full.png";
import {
    PartnerLink,
    PartnersSectionContainer
} from "./style";

export default function IntroSection(): JSX.Element {

    return (
        <PartnersSectionContainer>
            <PartnerLink
                href="/"
                target="_blank"
                >
                <img src={UsherLogo.src} style={{width: "107px", height: "62px"}} />
            </PartnerLink>
            <PartnerLink
                href="/"
                target="_blank"
                >
                <img src={PangolinLogo.src} style={{width: "171px", height: "50px"}} />
            </PartnerLink>
            <PartnerLink
                href="/"
                target="_blank"
                >
                <img src={NextstrainLogo.src} style={{width: "196px", height: "56px"}} />
            </PartnerLink>
        </PartnersSectionContainer>
    );
}