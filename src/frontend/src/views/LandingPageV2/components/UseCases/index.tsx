import Image from "next/image";
import UseCasesImg from "src/common/images/gen-epi-chart-desktop.png";
import UseCasesImgMobile from "src/common/images/gen-epi-chart-mobile.png";
import {
  UseCasesContainer,
  UseCasesHeader,
  UseCasesImage,
  UseCasesImageMobile,
} from "./style";

const imageAltText = `CZ Gen Epi bridges outbreak investigation and pathogen 
surveillance. On the left, "Outbreak investigation", includes 
questions such as: "Do these cases share a common source?", "How are these two 
outbreaks related?" and "Is this community transmission, or is this a new 
introduction?".  On the rights, "Pathogen surveillance includes questions such 
as "How has this changed over time?", "Which genotypes or variants are 
circulating in my community?" and "When was this variant first introduced?".`;

export default function UseCases(): JSX.Element {
  return (
    <UseCasesContainer>
      <UseCasesHeader>Understand the Spread of Disease</UseCasesHeader>
      <UseCasesImage>
        <Image alt={imageAltText} src={UseCasesImg} />
      </UseCasesImage>
      <UseCasesImageMobile>
        <Image alt={imageAltText} src={UseCasesImgMobile} />
      </UseCasesImageMobile>
    </UseCasesContainer>
  );
}
