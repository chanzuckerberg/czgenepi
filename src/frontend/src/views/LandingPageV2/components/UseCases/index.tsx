import React from "react";
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
                Use cases/how it's used headline
            </UseCasesHeader>
            <UseCasesImage src={UseCasesImg.src} />
            <UseCasesExampleContainer>
                <UseCasesExample 
                    headline="Use case 1 headline" 
                    copy="Integer posuere erat a ante venenatis dapibus posuere velit aliquet. Nullam quis risus eget urna mollis ornare vel eu leo."
                    />
                <UseCasesExample 
                    headline="Use case 2 headline" 
                    copy="Integer posuere erat a ante venenatis dapibus posuere velit aliquet. Nullam quis risus eget urna mollis ornare vel eu leo."
                    />
            </UseCasesExampleContainer>
            <UseCasesImageMobile src={UseCasesImgMobile.src} />
        </UseCasesContainer>
    );
}