import React from "react";
import Image from "next/image";
import UseCasesImg from "src/common/images/landingv2-use-cases.png";
import UseCasesImgMobile from "src/common/images/landingv2-use-cases-mobile.png";
import UseCasesExample from "./components/UseCasesExample";
import {
    UseCasesContainer,
    UseCasesExampleContainer,
    UseCasesHeader,
    UseCasesImage,
    UseCasesImageMobile
} from "./style";

export default function UseCases(): JSX.Element {

    return (
        <UseCasesContainer>
            <UseCasesHeader>
                Understand the Spread of Disease
            </UseCasesHeader>
            <UseCasesImage>
                <Image src={UseCasesImg} />
            </UseCasesImage>
            <UseCasesExampleContainer>
                <UseCasesExample 
                    headline="Outbreak Investigation" 
                    />
                <UseCasesExample 
                    headline="Pathogen Surveillance" 
                    />
            </UseCasesExampleContainer>
            <UseCasesImageMobile>
                <Image src={UseCasesImgMobile} />
            </UseCasesImageMobile>
        </UseCasesContainer>
    );
}