import Image from "next/image";
import ComputerImg from "src/common/images/landingv2-gen-epi-comp.png";
import {
  IntroContainer,
  IntroDescription,
  IntroHeading,
  IntroImage,
  IntroTextContainer,
} from "./style";

export default function IntroSection(): JSX.Element {
  return (
    <IntroContainer>
      <IntroImage>
        <Image src={ComputerImg} alt="" />
      </IntroImage>
      <IntroTextContainer>
        <IntroHeading>
          Translate pathogen data into public health insights
        </IntroHeading>
        <IntroDescription>
          Chan Zuckerberg GEN EPI helps local departments of public health
          identify the most effective interventions to stop the spread of
          disease. The secure, cloud-based platform streamlines the analysis of
          pathogen genomic data and generates phylogenetic trees with a single
          click—no need to install software or write code. These analyses help
          public health laboratorians, epidemiologists and public health
          officers track outbreaks and variants, and gain an overall picture of
          how pathogens are spreading in their community.
        </IntroDescription>
      </IntroTextContainer>
    </IntroContainer>
  );
}
