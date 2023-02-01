import { NewTabLink } from "src/common/components/library/NewTabLink";
import { Attribution, ImageSizer, NextstrainLogo } from "./style";
import Image from "next/image";
import NcbiLogo from "src/common/images/NCBI-virus-logo-minimal.png";
import { ROUTES } from "src/common/routes";

export const NcbiVirusAcknowledgement = (): JSX.Element => {
  return (
    <Attribution>
      Built in partnership with <NextstrainLogo />, enabled by data from&nbsp;
      <NewTabLink href={ROUTES.NCBI_VIRUS} target="_blank">
        <ImageSizer>
          <Image src={NcbiLogo} alt="NCBI Virus" />
        </ImageSizer>
      </NewTabLink>
      .
    </Attribution>
  );
};
