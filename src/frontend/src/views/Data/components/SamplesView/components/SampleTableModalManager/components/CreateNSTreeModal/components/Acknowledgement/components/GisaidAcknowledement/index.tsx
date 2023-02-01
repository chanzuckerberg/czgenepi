import { NewTabLink } from "src/common/components/library/NewTabLink";
import {
  Acknowledgements,
  Attribution,
  ImageSizer,
  NextstrainLogo,
  SpacedAcknowledgements,
} from "./style";
import Image from "next/image";
import GisaidLogo from "src/common/images/gisaid-logo-full.png";
import { Link } from "czifui";

export const GisaidAcknowledgement = () => {
  return (
    <>
      <Attribution>
        Built in partnership with <NextstrainLogo />, enabled by data from&nbsp;
        <NewTabLink href="https://gisaid.org/" target="_blank">
          <ImageSizer>
            <Image src={GisaidLogo} alt="GISAID" />
          </ImageSizer>
        </NewTabLink>
        .
      </Attribution>
      <SpacedAcknowledgements>
        We are grateful to the data contributors who shared the data used in
        this Web Application via the GISAID Initiative&#42;: the Authors, the
        Originating Laboratories responsible for obtaining the specimens, and
        the Submitting Laboratories that generated the genetic sequences and
        metadata.
      </SpacedAcknowledgements>
      <Acknowledgements>
        Data used in this web application remain subject to GISAID’s Terms and
        Conditions&nbsp;
        <Link href="http://www.gisaid.org/DAA/" target="_blank">
          http://www.gisaid.org/DAA/
        </Link>
        .
      </Acknowledgements>
    </>
  );
};
