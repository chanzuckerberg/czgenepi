import Image from "next/image";
import GisaidLogoImg from "src/common/images/gisaid-logo-full.png";
import NcbiVirusLogoImg from "src/common/images/ncbi-logo.png";
import NextcladeLogoImg from "src/common/images/nextclade-logo.png";
import NextstrainLogoImg from "src/common/images/nextstrain-logo-full.png";
import PangolinLogoImg from "src/common/images/pangolin-logo.png";
import UsherLogoImg from "src/common/images/usher-logo.png";
import { ROUTES } from "src/common/routes";
import {
  GisaidLogoLink,
  LogoItem,
  NcbiVirusLogoLink,
  NextcladeLogoLink,
  NextstrainLogoLink,
  PangolinLogoLink,
  PartnerLinkRow,
  PartnersSectionContainer,
  UsherLogoLink,
} from "./style";

export default function IntroSection(): JSX.Element {
  return (
    <>
      <PartnersSectionContainer>
        <PartnerLinkRow aria-label="attribution logos">
          <LogoItem>
            <NcbiVirusLogoLink href={ROUTES.NCBI_VIRUS} target="_blank">
              <Image alt="NCBI Virus" src={NcbiVirusLogoImg} />
            </NcbiVirusLogoLink>
          </LogoItem>
          <LogoItem>
            <GisaidLogoLink href={ROUTES.GISAID} target="_blank">
              <Image alt="GISAID" src={GisaidLogoImg} />
            </GisaidLogoLink>
          </LogoItem>
          <LogoItem>
            <NextstrainLogoLink href={ROUTES.NEXTSTRAIN} target="_blank">
              <Image alt="Nextstrain" src={NextstrainLogoImg} />
            </NextstrainLogoLink>
          </LogoItem>
          <LogoItem>
            <UsherLogoLink href={ROUTES.USHER} target="_blank">
              <Image alt="Usher" src={UsherLogoImg} />
            </UsherLogoLink>
          </LogoItem>
          <LogoItem>
            <PangolinLogoLink href={ROUTES.PANGOLIN} target="_blank">
              <Image alt="Pangolin" src={PangolinLogoImg} />
            </PangolinLogoLink>
          </LogoItem>
          <LogoItem>
            <NextcladeLogoLink href={ROUTES.NEXTCLADE} target="_blank">
              <Image alt="Nextclade" src={NextcladeLogoImg} />
            </NextcladeLogoLink>
          </LogoItem>
        </PartnerLinkRow>
      </PartnersSectionContainer>
    </>
  );
}
