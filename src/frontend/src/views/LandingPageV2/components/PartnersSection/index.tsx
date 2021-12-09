import Image from "next/image";
import React from "react";
import NextstrainLogoImg from "src/common/images/nextstrain-logo-full.png";
import PangolinLogoImg from "src/common/images/pangolin-logo.png";
import UsherLogoImg from "src/common/images/usher-logo.png";
import { ROUTES } from "src/common/routes";
import {
  NextstrainLogo,
  PangolinLogo,
  PartnerLink,
  PartnersSectionContainer,
  UsherLogo,
} from "./style";

export default function IntroSection(): JSX.Element {
  return (
    <PartnersSectionContainer>
      <PartnerLink href={ROUTES.USHER} target="_blank">
        <UsherLogo>
          <Image src={UsherLogoImg} />
        </UsherLogo>
      </PartnerLink>
      <PartnerLink href={ROUTES.PANGOLIN} target="_blank">
        <PangolinLogo>
          <Image src={PangolinLogoImg} />
        </PangolinLogo>
      </PartnerLink>
      <PartnerLink href={ROUTES.NEXTSTRAIN} target="_blank">
        <NextstrainLogo>
          <Image src={NextstrainLogoImg} />
        </NextstrainLogo>
      </PartnerLink>
    </PartnersSectionContainer>
  );
}
