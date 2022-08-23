import Image from "next/image";
import GisaidLogoImg from "src/common/images/gisaid-logo-full.png";
import NextstrainLogoImg from "src/common/images/nextstrain-logo-full.png";
import PangolinLogoImg from "src/common/images/pangolin-logo.png";
import UsherLogoImg from "src/common/images/usher-logo.png";
import { ROUTES } from "src/common/routes";
import {
  GisaidLogo,
  NextstrainLogo,
  PangolinLogo,
  PartnerLink,
  PartnerLinkRow,
  PartnersSectionContainer,
  UsherLogo,
} from "./style";

export default function IntroSection(): JSX.Element {
  return (
    <>
      <PartnersSectionContainer>
        <PartnerLinkRow>
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
        </PartnerLinkRow>
        <PartnerLinkRow>
          <PartnerLink href={ROUTES.NEXTSTRAIN} target="_blank">
            <NextstrainLogo>
              <Image src={NextstrainLogoImg} />
            </NextstrainLogo>
          </PartnerLink>
          <PartnerLink href={ROUTES.GISAID} target="_blank">
            <GisaidLogo>
              <Image src={GisaidLogoImg} />
            </GisaidLogo>
          </PartnerLink>
        </PartnerLinkRow>
      </PartnersSectionContainer>
    </>
  );
}
