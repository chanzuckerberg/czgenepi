import Image from "next/image";
import UseCasesImg from "src/common/images/gen-epi-chart-desktop.png";
import UseCasesImgMobile from "src/common/images/gen-epi-chart-mobile.png";
import {
  UseCasesContainer,
  UseCasesHeader,
  UseCasesImage,
  UseCasesImageMobile,
} from "./style";

export default function UseCases(): JSX.Element {
  return (
    <UseCasesContainer>
      <UseCasesHeader>Understand the Spread of Disease</UseCasesHeader>
      <UseCasesImage>
        <Image src={UseCasesImg} />
      </UseCasesImage>
      <UseCasesImageMobile>
        <Image src={UseCasesImgMobile} />
      </UseCasesImageMobile>
    </UseCasesContainer>
  );
}
